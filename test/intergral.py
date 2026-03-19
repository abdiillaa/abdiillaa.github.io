n = 100000000
def f(x):
    return x**2
x=10
ax=x/n
s=0
for i in range(n):
    s+=f(i*ax)
print(s*ax)
