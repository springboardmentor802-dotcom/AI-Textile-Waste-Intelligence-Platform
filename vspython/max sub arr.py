arr = list(map(int, input("Enter array elements: ").split()))
n=len(arr)
maxi= float('-inf')
for i in range(n):
    curr_sum=0
    for j in range(i,n):
        curr_sum+=arr[j]
        maxi=max(maxi,curr_sum)
print(maxi)