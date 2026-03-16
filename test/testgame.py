import numpy as np
import math
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation

# --- Тұрақтылар ---
g = np.array([0, 0, -9.81])  # Ауырлық үдеуі (m/s^2)
dt = 0.05  # Уақыт қадамы (s)
time_limit = 20  # Симуляция уақыты (s)

# --- Физикалық симуляция функциясы (Эйлер әдісі) ---
def simulate_rocket(pos_init, vel_init, k_drag=0.01, mass=1.0):
    pos = np.array(pos_init, dtype=float)
    vel = np.array(vel_init, dtype=float)
    trajectory = [pos.copy()]
    
    t = 0
    while t < time_limit and pos[2] >= 0: # Жерге тигенше ұшады
        # Ауа кедергісі ( жылдамдыққа пропорционал)
        # F_drag = -k * v
        drag = -k_drag * vel
        
        # Жалпы күш: F = F_drag + F_gravity (F = ma, m=1)
        force = drag + mass * g
        
        # Интегралдау (жылдамдық пен орынды жаңарту)
        vel += force / mass * dt
        pos += vel * dt
        
        trajectory.append(pos.copy())
        t += dt
    
    return np.array(trajectory)

# --- Бұрыштарды (градус) векторға (v) айналдыру ---
def angles_to_vector(azimuth_deg, elevation_deg, speed):
    azimuth_rad = math.radians(azimuth_deg)
    elevation_rad = math.radians(elevation_deg)
    
    vx = speed * math.cos(elevation_rad) * math.cos(azimuth_rad)
    vy = speed * math.cos(elevation_rad) * math.sin(azimuth_rad)
    vz = speed * math.sin(elevation_rad)
    
    return np.array([vx, vy, vz])

# ==========================================
# --- Симуляция параметрлері ---
# ==========================================

# 1. Нысана ракетасы (Target)
target_start = [2000, 2000, 0] # Бастапқы орны (x, y, z)
target_angles = angles_to_vector(azimuth_deg=-135, elevation_deg=60, speed=250) # Бағыты
target_drag = 0.005 # Ауа кедергісі (жіңішке)

# 2. Сенің ракетаң (Interceptor)
my_start = [0, 0, 0] # Сенің орның
# !!! МЫНА ЖЕРДІ ӨЗГЕРТ: Тигізу үшін бұрыштарды тап !!!
my_azimuth = 45 # Азимут бұрышы (0-360 градус, x осінен бастап)
my_elevation = 79 # Биіктік бұрышы (0-90 градус)
my_speed = 229 # Ракетаның жылдамдығы
my_angles = angles_to_vector(azimuth_deg=my_azimuth, elevation_deg=my_elevation, speed=my_speed)
my_drag = 0.01 # Ауа кедергісі (сәл жоғары)

# --- Симуляцияны іске қосу ---
target_traj = simulate_rocket(target_start, target_angles, k_drag=target_drag)
my_traj = simulate_rocket(my_start, my_angles, k_drag=my_drag)

# ==========================================
# --- 3D Визуализация (Matplotlib) ---
# ==========================================

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Траектория сызықтары
line_target, = ax.plot(target_traj[:, 0], target_traj[:, 1], target_traj[:, 2], 'r-', label='Target')
line_my, = ax.plot(my_traj[:, 0], my_traj[:, 1], my_traj[:, 2], 'b-', label='My Rocket')

# Ракета нүктелері
point_target, = ax.plot([target_traj[0, 0]], [target_traj[0, 1]], [target_traj[0, 2]], 'ro')
point_my, = ax.plot([my_traj[0, 0]], [my_traj[0, 1]], [my_traj[0, 2]], 'bo')

ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('Rocket Intercept Simulator')
ax.legend()

# Масштабты теңестіру
max_range = np.max([np.max(np.abs(target_traj)), np.max(np.abs(my_traj))])
ax.set_xlim(0, max_range)
ax.set_ylim(0, max_range)
ax.set_zlim(0, max_range)

# --- Анимация ---
# --- Анимацияны түзетілген нұсқасы ---
# Соқтығысу радиусы (метрмен)
collision_radius = 50 

def update(i):
    # Екі ракетаның қазіргі орнын аламыз
    if i < len(target_traj) and i < len(my_traj):
        pos_t = target_traj[i]
        pos_m = my_traj[i]
        
        # Арақашықтықты есептеу (Пифагор теоремасы 3D-де)
        distance = np.linalg.norm(pos_t - pos_m)
        
        if distance < collision_radius:
            print(f"БОМ! Соқтығысу болды! Арақашықтық: {distance:.2f} м")
            ani.event_source.stop() # Анимацияны тоқтату
            return point_target, point_my
            
    # Нүктелерді жаңарту (сен жазған түзетілген код)
    if i < len(target_traj):
        point_target.set_data([target_traj[i, 0]], [target_traj[i, 1]])
        point_target.set_3d_properties([target_traj[i, 2]])
    if i < len(my_traj):
        point_my.set_data([my_traj[i, 0]], [my_traj[i, 1]])
        point_my.set_3d_properties([my_traj[i, 2]])
        
    return point_target, point_my

# Анимацияны іске қосу
num_frames = max(len(target_traj), len(my_traj))
ani = animation.FuncAnimation(fig, update, frames=num_frames, interval=20, blit=True)

plt.show()