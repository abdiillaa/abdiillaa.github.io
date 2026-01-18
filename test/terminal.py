import time
import random
import sys

# ===== ТҮСТЕР ЖӘНЕ КОНФИГУРАЦИЯ =====
GREEN  = "\033[32m"
YELLOW = "\033[33m"
WHITE  = "\033[37m"
RESET  = "\033[0m"
LIGHTS = ["\033[31m", "\033[33m", "\033[34m", "\033[35m", "\033[36m"]
STAR = "\033[33m★\033[0m"

tree_structure = [
    "     |     ",
    "    |||    ",
    "   |||||   ",
    "  |||||||  ",
    " ||||||||| ",
    "|||||||||||",
    "    :::    ",
]

lyrics = [
    "Focused, I'm focused",
    "She got a body like that, I ain't never seen nothin' like that",
    "Like a fantasy in front of me, yeah",
    "I think that something special's going down",
    "That's right, I think she foreign (foreign)",
    "I think she foreign (foreign), got passports",
    "Mi amor ('mor), started slow (slow), got faster",
]

def color_line(line):
    """Шыршаның шамдарын кездейсоқ түске бояу"""
    out = ""
    for ch in line:
        if ch == "|":
            out += random.choice(LIGHTS) + ch + RESET
        elif ch == ":":
            out += YELLOW + ch + RESET
        else:
            out += GREEN + ch + RESET
    return out

def draw_frame(current_line_idx, current_char_idx):
    """Экранды басынан бастап қайта салады (шырша + жазылып жатқан мәтін)"""
    sys.stdout.write("\033[H") # Курсорды сол жақ жоғарыға апару
    
    # 1. Жұлдыз
    print(" " * 8 + STAR)
    
    # 2. Шырша мен мәтін
    for i in range(len(tree_structure)):
        left_tree = " " * 3 + color_line(tree_structure[i])
        
        # Мәтінді шығару логикасы:
        # Егер бұл жол бұрын толық жазылып қойса:
        if i < current_line_idx:
            line_text = lyrics[i]
        # Егер бұл қазір жазылып жатқан жол болса:
        elif i == current_line_idx:
            line_text = lyrics[i][:current_char_idx]
        # Әлі жетпеген жолдар болса:
        else:
            line_text = ""
            
        print(f"{left_tree}         {WHITE}{line_text}{RESET}")

# --- НЕГІЗГІ ПРОЦЕСС ---
print("\033c", end="") # Экранды бір рет тазалау

# Әр жол бойынша жүріп өту
for l_idx in range(len(lyrics)):
    # Әр әріп бойынша жүріп өту
    for c_idx in range(len(lyrics[l_idx]) + 1):
        draw_frame(l_idx, c_idx)
        time.sleep(0.05) # Әріптің шығу жылдамдығы (әрі шыршаның жыпылықтау жылдамдығы)

# Мәтін біткен соң шырша жыпылықтап тұра береді
try:
    while True:
        draw_frame(len(lyrics), 0)
        time.sleep(0.3)
except KeyboardInterrupt:
    print("\n\n" + " " * 7 + "Аяқталды.")