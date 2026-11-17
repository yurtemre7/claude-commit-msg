# Draws images/icon.png (32x32 pixel art, scaled up). Usage: python3 scripts/icon.py images/icon.png [scale=4]
import zlib, struct, sys
N = 32
T = (0, 0, 0, 0)
BG = (224, 122, 79, 255); BGD = (184, 83, 42, 255); BGL = (240, 152, 110, 255)
K = (58, 36, 24, 255); W = (255, 255, 255, 255); C = (255, 236, 214, 255)
CS = (240, 200, 168, 255); P = (245, 140, 130, 255); R = (200, 60, 70, 255)
G = (60, 180, 100, 255); O = (232, 110, 60, 255)
px = [[T] * N for _ in range(N)]

def put(x, y, c):
    if 0 <= x < N and 0 <= y < N: px[y][x] = c
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)
def rrect(x0, y0, x1, y1, c, r=2, under=None):
    under = under or BG
    rect(x0, y0, x1, y1, c)
    for dx, dy in [(0,0),(1,0),(0,1)][: r + 1]:
        for (x, y) in [(x0+dx, y0+dy), (x1-dx, y0+dy), (x0+dx, y1-dy), (x1-dx, y1-dy)]: put(x, y, under)

# background: orange rounded square with darker bottom edge for a bit of depth
rrect(0, 0, 31, 31, BGD, under=T)
rrect(0, 0, 31, 30, BG, under=T)
for x, y in [(0,30),(1,30),(30,30),(31,30),(0,29),(31,29)]: put(x, y, T if (x in (0,31) and y==30) else BGD)
rect(3, 1, 10, 1, BGL); rect(2, 2, 3, 4, BGL)

# speech bubble with a git graph
rrect(14, 2, 29, 13, K, 1)
rrect(15, 3, 28, 12, W, 1, under=K)
put(17, 13, W); put(18, 13, W); put(17, 14, W)
for x, y in [(16,14),(18,14),(16,15),(17,15)]: put(x, y, K)
rect(17, 9, 27, 9, K)                          # main branch
for x, y in [(19,9),(20,8),(21,7),(22,6)]: put(x, y, K)  # feature branch up
rect(22, 6, 24, 6, K)
for x, y in [(25,7),(26,8)]: put(x, y, K)        # merge back
def dot(cx, cy, c):
    rect(cx-1, cy-1, cx+1, cy+1, K); put(cx, cy, c)
dot(17, 9, O); dot(22, 9, O); dot(23, 6, O); dot(27, 9, G)
# green check above the merged commit
for x, y in [(25,4),(26,5),(27,4),(28,3)]: put(x, y, G)

# commit-dot antenna on the head
rect(9, 12, 9, 14, K); dot(9, 11, G)
put(8, 10, K); put(10, 10, K); put(8, 12, K); put(10, 12, K); put(9, 10, K); put(9, 12, K)
put(9, 11, G)

# body: cream blob with dark outline
rrect(3, 15, 16, 28, K, 2)
rrect(4, 16, 15, 27, C, 2, under=K)
rect(5, 26, 14, 27, CS)                        # belly shade
# eyes: left open, right winking
rect(6, 18, 7, 20, W); rect(7, 19, 7, 20, K)
put(11, 19, K); put(12, 18, K); put(13, 19, K)
# cheeks
put(5, 22, P); put(6, 22, P); put(13, 22, P); put(14, 22, P)
# big open grin with tongue
rect(7, 22, 12, 22, K); rect(7, 23, 12, 24, K); rect(8, 25, 11, 25, K)
rect(8, 23, 11, 23, R); rect(9, 24, 10, 24, P)
# feet
rect(5, 29, 7, 29, K); rect(12, 29, 14, 29, K)
rect(5, 28, 7, 28, K); rect(12, 28, 14, 28, K)

scale = int(sys.argv[2]) if len(sys.argv) > 2 else 4
rows = b''
for y in range(N * scale):
    rows += b'\x00' + b''.join(bytes(px[y // scale][x // scale]) for x in range(N * scale))
def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', N*scale, N*scale, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b'')
open(sys.argv[1], 'wb').write(png)
