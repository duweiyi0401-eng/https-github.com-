import pygame
import random
import sys

# 初始化 Pygame
pygame.init()

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)
PURPLE = (128, 0, 128)
RED = (255, 0, 0)

# 游戏设置
BLOCK_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SCREEN_WIDTH = BLOCK_SIZE * (GRID_WIDTH + 8)
SCREEN_HEIGHT = BLOCK_SIZE * GRID_HEIGHT

# 创建游戏窗口
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption('俄罗斯方块')

# 定义方块形状
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # L
    [[1, 1, 1], [0, 0, 1]],  # J
    [[1, 1, 0], [0, 1, 1]],  # S
    [[0, 1, 1], [1, 1, 0]]   # Z
]

COLORS = [CYAN, YELLOW, PURPLE, ORANGE, BLUE, GREEN, RED]

class Tetris:
    def __init__(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = self.new_piece()
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_time = 0
        self.fall_speed = 500  # 毫秒
        
    def new_piece(self):
        # 随机选择一个方块和颜色
        shape_idx = random.randint(0, len(SHAPES) - 1)
        return {
            'shape': SHAPES[shape_idx],
            'color': COLORS[shape_idx],
            'x': GRID_WIDTH // 2 - len(SHAPES[shape_idx][0]) // 2,
            'y': 0
        }
    
    def valid_move(self, piece, dx=0, dy=0, rotation=0):
        # 获取旋转后的形状
        shape = piece['shape']
        if rotation:
            shape = list(zip(*shape[::-1]))  # 旋转90度
        
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell:
                    new_x = piece['x'] + x + dx
                    new_y = piece['y'] + y + dy
                    
                    if (new_x < 0 or new_x >= GRID_WIDTH or 
                        new_y >= GRID_HEIGHT or 
                        (new_y >= 0 and self.grid[new_y][new_x])):
                        return False
        return True
    
    def place_piece(self):
        # 将当前方块放置到网格中
        for y, row in enumerate(self.current_piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    grid_y = self.current_piece['y'] + y
                    grid_x = self.current_piece['x'] + x
                    if grid_y >= 0:
                        self.grid[grid_y][grid_x] = self.current_piece['color']
        
        # 检查是否有完整的行
        self.clear_lines()
        
        # 生成新的方块
        self.current_piece = self.new_piece()
        
        # 检查游戏是否结束
        if not self.valid_move(self.current_piece):
            self.game_over = True
    
    def clear_lines(self):
        lines_to_clear = []
        for y in range(GRID_HEIGHT):
            if all(self.grid[y]):
                lines_to_clear.append(y)
        
        for line in lines_to_clear:
            del self.grid[line]
            self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
        
        # 更新分数
        if lines_to_clear:
            self.lines_cleared += len(lines_to_clear)
            self.score += len(lines_to_clear) * 100 * self.level
            self.level = self.lines_cleared // 10 + 1
            self.fall_speed = max(50, 500 - (self.level - 1) * 50)
    
    def move_piece(self, dx, dy):
        if self.valid_move(self.current_piece, dx, dy):
            self.current_piece['x'] += dx
            self.current_piece['y'] += dy
            return True
        return False
    
    def rotate_piece(self):
        if self.valid_move(self.current_piece, rotation=1):
            self.current_piece['shape'] = list(zip(*self.current_piece['shape'][::-1]))
    
    def drop_piece(self):
        while self.move_piece(0, 1):
            pass
        self.place_piece()
    
    def draw(self):
        screen.fill(BLACK)
        
        # 绘制网格
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if self.grid[y][x]:
                    pygame.draw.rect(screen, self.grid[y][x],
                                   (x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE))
                pygame.draw.rect(screen, WHITE,
                               (x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE), 1)
        
        # 绘制当前方块
        for y, row in enumerate(self.current_piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    pygame.draw.rect(screen, self.current_piece['color'],
                                   ((self.current_piece['x'] + x) * BLOCK_SIZE,
                                    (self.current_piece['y'] + y) * BLOCK_SIZE,
                                    BLOCK_SIZE, BLOCK_SIZE))
        
        # 绘制分数和等级
        font = pygame.font.Font(None, 36)
        score_text = font.render(f'分数: {self.score}', True, WHITE)
        level_text = font.render(f'等级: {self.level}', True, WHITE)
        lines_text = font.render(f'消除行数: {self.lines_cleared}', True, WHITE)
        
        screen.blit(score_text, (GRID_WIDTH * BLOCK_SIZE + 10, 50))
        screen.blit(level_text, (GRID_WIDTH * BLOCK_SIZE + 10, 100))
        screen.blit(lines_text, (GRID_WIDTH * BLOCK_SIZE + 10, 150))
        
        # 绘制游戏结束信息
        if self.game_over:
            game_over_font = pygame.font.Font(None, 48)
            game_over_text = game_over_font.render('游戏结束!', True, RED)
            restart_text = font.render('按R重新开始', True, WHITE)
            
            screen.blit(game_over_text, (SCREEN_WIDTH // 2 - 100, SCREEN_HEIGHT // 2 - 50))
            screen.blit(restart_text, (SCREEN_WIDTH // 2 - 80, SCREEN_HEIGHT // 2 + 10))
        
        pygame.display.flip()

def main():
    clock = pygame.time.Clock()
    game = Tetris()
    
    while True:
        current_time = pygame.time.get_ticks()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if event.type == pygame.KEYDOWN:
                if not game.game_over:
                    if event.key == pygame.K_LEFT:
                        game.move_piece(-1, 0)
                    elif event.key == pygame.K_RIGHT:
                        game.move_piece(1, 0)
                    elif event.key == pygame.K_DOWN:
                        game.move_piece(0, 1)
                    elif event.key == pygame.K_UP:
                        game.rotate_piece()
                    elif event.key == pygame.K_SPACE:
                        game.drop_piece()
                
                if event.key == pygame.K_r and game.game_over:
                    game = Tetris()
        
        # 自动下落
        if not game.game_over and current_time - game.fall_time > game.fall_speed:
            if not game.move_piece(0, 1):
                game.place_piece()
            game.fall_time = current_time
        
        game.draw()
        clock.tick(60)

if __name__ == '__main__':
    main()
