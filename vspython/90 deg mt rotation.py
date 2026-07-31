n, m = map(int, input("Enter dimensions: ").split())
matrix = [list(map(int, input().split())) for _ in range(n)]
ans=[[0]*n for _ in range(m)]
for i in range(n):
    for j in range(m):
        ans[j][n-1-i]=matrix[i][j]
print("------------")
for i in range(m):
    print(' '.join(map(str, ans[i])))
