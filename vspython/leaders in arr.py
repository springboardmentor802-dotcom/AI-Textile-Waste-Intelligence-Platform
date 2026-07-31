arr=list(map(int,input("Enter array elements: ").split()))
n=len(arr)
leaders=[]
for i in range(n):
    fl=True
    for j in range(i+1,n):
        if arr[i]<=arr[j]:
            fl=False
            break
    if fl==True:
        leaders.append(arr[i])
print("Leaders in the array are:",leaders)