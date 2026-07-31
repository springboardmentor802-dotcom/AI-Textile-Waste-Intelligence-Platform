arr=list(map(int,input("Enter array elements: ").split()))
n=len(arr)
if n==0:
    print(0)
longest=1
sets=set(arr)
for i in range(n):
    sets.add(arr[i])
for i in range(n):
    if arr[i]-1 not in sets:
        curr=arr[i]
        curr_longest=1
        while curr+1 in sets:
            curr+=1
            curr_longest+=1
        longest=max(longest,curr_longest)
print("Length of longest consecutive elements sequence is:",longest)