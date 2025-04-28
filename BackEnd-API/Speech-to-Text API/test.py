import torch
import os
import subprocess

def check_cuda():
    print("Checking CUDA availability...")
    if not torch.cuda.is_available():
        print("CUDA is not available. Please check your GPU drivers and CUDA installation.")
        return False
    else:
        print("CUDA Available: True")
        return True

def check_device_info():
    try:
        current_device = torch.cuda.current_device()
        print(f"Current Device Index: {current_device}")
        print(f"GPU Name: {torch.cuda.get_device_name(current_device)}")
    except Exception as e:
        print(f"Error while querying CUDA device: {e}")
        return False
    return True

def check_cudnn():
    print("Checking cuDNN availability...")
    try:
        if torch.backends.cudnn.enabled:
            print("cuDNN Available: True")
        else:
            print("cuDNN Available: False")
            print("Try reinstalling cuDNN or check your cuDNN version compatibility with CUDA.")
            return False
    except Exception as e:
        print(f"Error while checking cuDNN: {e}")
        return False
    return True

def simple_cuda_test():
    print("Running a simple CUDA operation...")
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        tensor = torch.randn(3, 3, device=device)
        print("Tensor created on GPU:", tensor)
    except Exception as e:
        print(f"Error during CUDA operation: {e}")
        return False
    return True

def check_environment_variables():
    print("Checking CUDA environment variables...")
    try:
        cuda_path = os.environ.get("CUDA_PATH")
        cudnn_path = os.environ.get("CUDNN_INCLUDE_DIR")
        if not cuda_path or not cudnn_path:
            print("CUDA or cuDNN environment variables are not set properly.")
            print("Please set the CUDA_PATH and CUDNN_INCLUDE_DIR environment variables.")
        else:
            print("CUDA_PATH:", cuda_path)
            print("CUDNN_INCLUDE_DIR:", cudnn_path)
    except Exception as e:
        print(f"Error while checking environment variables: {e}")

def check_pytorch_version():
    print("Checking PyTorch version...")
    pytorch_version = torch.__version__
    print(f"PyTorch version: {pytorch_version}")

def main():
    # Step 1: Check if CUDA is available
    if not check_cuda():
        return

    # Step 2: Check device info
    if not check_device_info():
        return

    # Step 3: Check cuDNN availability
    if not check_cudnn():
        return

    # Step 4: Run simple CUDA operation
    if not simple_cuda_test():
        return

    # Step 5: Check environment variables for CUDA and cuDNN
    check_environment_variables()

    # Step 6: Check PyTorch version compatibility with CUDA
    check_pytorch_version()

if __name__ == "__main__":
    main()
