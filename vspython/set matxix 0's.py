n, m = map(int, input("Enter dimensions: ").split())
matrix = [list(map(int, input().split())) for _ in range(n)]
col = [0] * m
row = [0] * n
for i in range(n):
    for j in range(m):
        if matrix[i][j] == 0:
            row[i] = 1
            col[j] = 1
for i in range(n):
    for j in range(m):
        if row[i] == 1 or col[j] == 1:
            matrix[i][j] = 0
print("------------")
for i in range(n):
    print(' '.join(map(str, matrix[i])))