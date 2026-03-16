import math
def f(x):
    return 6*x/(3*x**2+5)

def derivative(x, dx=0.00000000001):
    # Туындының анықтамасы бойынша: (f(x+dx) - f(x)) / dx
    return (f(x + dx) - f(x)) / dx

point = 1
print(f"нүктедегі туынды {point}:", derivative(point))
