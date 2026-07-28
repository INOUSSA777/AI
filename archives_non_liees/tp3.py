
n=int(input("entrer le rang: "))
while n<1:
    n=int(input('entrer la valeur > à 1'))
u_0 = 1
u_1 = 2
i=1
#while(i<n):
    #u=u_0+u_1
    #u_0=u_1
    #u_1=u
    #i+=1
#print("le terme de rang", n, "est égal à", u)

#for i in range(2,n+1,1):
 #   u=u_0+u_1
  #  u_0,u_1=u_1,u
#print("le terme de rang", n,"est egal à",u)

######################################
from math import sqrt
R=sqrt(n)
for i in range(n-1,0,-1):
    R=sqrt(i+R)
print("la valeur est",R)