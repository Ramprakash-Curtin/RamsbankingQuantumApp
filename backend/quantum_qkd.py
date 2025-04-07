from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def generate_quantum_key(length=8):
    simulator = AerSimulator()
    key = ""

    for _ in range(length):
        qc = QuantumCircuit(1, 1)
        qc.h(0)  # Create superposition
        qc.measure(0, 0)

        result = simulator.run(qc, shots=1).result()
        counts = result.get_counts()
        bit = list(counts.keys())[0]  # Get the measured bit
        key += bit

    return key
