class Observer:
    def __init__(self):
        self.observers = []
    
    def register(self, callback):
        self.observers.append(callback)
    
    def notify(self):
        for obs in self.observers:
            obs()
    