import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader
import torch.optim as optim
import os

ai_mod = None

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear_relu_stack = nn.Sequential(
            nn.Linear(4, 10),
            nn.ReLU(),
            nn.Linear(10, 10),
            nn.ReLU(),
            nn.Linear(10, 1),
        )

    def forward(self, x):
        logits = self.linear_relu_stack(x)
        return logits

def init_model():
    global ai_mod
    if not ai_mod:
        mod = NeuralNetwork()
        mod.load_state_dict(torch.load("/game/game/model.pth", weights_only=True))
        mod.eval()
        ai_mod = mod
    return ai_mod
