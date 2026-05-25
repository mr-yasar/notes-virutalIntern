import sys
import subprocess

def install_dependencies():
    print("==================================================")
    print("Verifying and installing Python dependencies...")
    print("==================================================")
    try:
        # Run pip install using the active python executable
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("\nDependencies verified successfully.\n")
    except Exception as e:
        print(f"\nWarning: Automatic dependency installation failed: {e}")
        print("Please run: pip install -r requirements.txt manually.\n")

if __name__ == "__main__":
    # Perform automated dependency check/install
    install_dependencies()

    # Import uvicorn locally after installation verification
    try:
        import uvicorn
    except ImportError:
        print("Error: 'uvicorn' is not installed. Trying one more time to install it...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn", "fastapi", "sqlalchemy", "pydantic"])
            import uvicorn
        except Exception as err:
            print(f"Failed to install uvicorn: {err}")
            sys.exit(1)

    print("==================================================")
    print("Starting Magical Notes Application Server...")
    print("   --> UI & API: http://127.0.0.1:8000")
    print("   --> API Docs: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to terminate.")
    print("==================================================")
    
    # Run uvicorn server serving backend/main.py -> app
    # reload=True makes development easy
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
