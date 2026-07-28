n=0
while n<5 :
    n=int(input('n='))
v=[0]*n
print(v)
for i in range(n):
    v[i]=float(input(f'v=[{i+1}]='))
    print(v)

moyenne=sum(v)/len(v)
print("moyenne=",moyenne)

import statistics
ecart_typ=statistics.stdev(v)
print("ecart-type=", ecart_typ)



