from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
SERVICES = {
    "backend": ROOT_DIR / "backend",
    "frontend": ROOT_DIR / "frontend",
}

EXPECTED_PORTS = {
    "backend": 3000,
    "frontend": 5173,
}


def get_npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def stream_output(name: str, process: subprocess.Popen) -> None:
    if process.stdout is None:
        return

    try:
        for line in process.stdout:
            try:
                print(f"[{name}] {line}", end="")
            except (ValueError, RuntimeError):
                break
    finally:
        try:
            process.stdout.close()
        except Exception:
            pass



def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0



def start_service(name: str, path: Path) -> tuple[subprocess.Popen, threading.Thread] | None:
    if not path.exists():
        raise FileNotFoundError(f"Pasta não encontrada: {path}")

    if not (path / "package.json").exists():
        raise FileNotFoundError(f"package.json não encontrado em: {path}")

    if not (path / "node_modules").exists():
        print(f"[aviso] Dependências não encontradas em '{name}'. Execute 'npm install' nessa pasta se necessário.")

    expected_port = EXPECTED_PORTS.get(name)
    if expected_port and is_port_in_use(expected_port):
        print(f"[aviso] A porta {expected_port} já está em uso. O {name} pode já estar rodando.")
        if name == "backend":
            print(f"[aviso] Pulando nova inicialização do backend para evitar erro de porta ocupada.")
            return None

    process = subprocess.Popen(
        [get_npm_command(), "run", "dev"],
        cwd=path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
    )

    output_thread = threading.Thread(target=stream_output, args=(name, process), name=f"{name}-output")
    output_thread.start()
    return process, output_thread



def stop_process(process: subprocess.Popen) -> None:
    if process.poll() is None:
        try:
            if os.name == "nt":
                process.terminate()
            else:
                process.send_signal(signal.SIGTERM)
            process.wait(timeout=5)
        except Exception:
            process.kill()
            process.wait(timeout=5)

    if process.stdout is not None:
        try:
            process.stdout.close()
        except Exception:
            pass



def main() -> int:
    print("Iniciando backend e frontend do TarefaFácil...\n")

    processes: dict[str, subprocess.Popen] = {}
    output_threads: list[threading.Thread] = []

    try:
        for name, path in SERVICES.items():
            started = start_service(name, path)
            if started is not None:
                process, output_thread = started
                processes[name] = process
                output_threads.append(output_thread)

        print("\nServiços preparados. URLs esperadas:")
        print("- Backend:  http://localhost:3000")
        print("- Frontend: http://localhost:5173")
        print("\nPressione Ctrl+C para encerrar os processos iniciados por este script.\n")

        if not processes:
            print("Nenhum novo processo foi iniciado porque os serviços já parecem estar em execução.")
            return 0

        while True:
            finished = {name: proc.poll() for name, proc in processes.items() if proc.poll() is not None}
            if finished:
                for name, code in finished.items():
                    print(f"\n[{name}] processo finalizado com código {code}.")
                return 1
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nEncerrando backend e frontend...")
        return 0
    finally:
        for process in processes.values():
            stop_process(process)

        for thread in output_threads:
            thread.join(timeout=2)


if __name__ == "__main__":
    sys.exit(main())
