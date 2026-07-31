arr = list(map(int, input("Enter array elements: ").split()))
p = int(input("Enter k value: "))
leng=0
for i in range(len(arr)):
    for j in range(i, len(arr)):
        s=0
        for k in range(i, j+1):
            s+=arr[k]
        if s==p:
            leng=max(leng, j-i+1)
print(leng)
        