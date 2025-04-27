import torch
print(torch.cuda.is_available())  # Should return True
print(torch.cuda.current_device())  # Should return the device index
print(torch.cuda.get_device_name(0))  # Should print GPU name
