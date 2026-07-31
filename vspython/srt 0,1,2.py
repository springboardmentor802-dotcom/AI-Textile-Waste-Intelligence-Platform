arr = list(map(int, input("Enter array elements: ").split()))
n = len(arr)

c0=0
c1=1
c2=2
for i in range(n):
    if arr[i]==0:
        c0+=1
    elif arr[i]==1:
        c1+=1
    else:
        c2+=1
for i in range(n):
    arr[i]=0
for i in range(c0, c0+c1):
    arr[i]=1
for i in range(c0+c1, n):
    arr[i]=2
print(arr)
