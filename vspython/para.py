def para(s, l, r):
    if len(s) == 2 * n:
        ans.append(s)
        return
    if l < n:
        para(s + '(', l + 1, r)
    if r < l:
        para(s + ')', l, r + 1)

def generate_parentheses(n_pairs):
    global n, ans
    n = n_pairs
    ans = []
    para('', 0, 0)
    return ans

n_pairs = 3  # Replace with the desired number of pairs of parentheses
print(generate_parentheses(n_pairs))
