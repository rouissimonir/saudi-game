"""Renders the 30 merge-board item icons (256px transparent PNG) with Blender.

    SAMPLES=64 SIZE=256 ONLY=qahwa_3,gen_oud python make_items.py -- public/assets/art/items
"""
import math, os, random, sys
import bpy
from mathutils import Vector

os.environ.setdefault('SIZE', '256')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_art as A  # noqa: E402  (shared helpers and the hero props)
from make_art import (reset, mat, assign, lathe, sphere, cyl, box, torus, curve_tube,  # noqa: E402
                      BRASS, COPPER, WHITE, COFFEE, WOOD, DATE, RED, BEAN)

OUT = A.OUT

# ------------------------------------------------------------------ palette
GOLD = lambda: mat('gold', (0.95, 0.68, 0.14), 1.0, 0.2)
BURLAP = lambda: mat('burlap', (0.50, 0.34, 0.18), 0.0, 0.95)
GREEN_BEAN = lambda: mat('green_bean', (0.34, 0.45, 0.16), 0.0, 0.45, coat=0.2)
TAN_BEAN = lambda: mat('tan_bean', (0.58, 0.34, 0.14), 0.0, 0.4, coat=0.2)
CARDAMOM = lambda: mat('cardamom', (0.38, 0.58, 0.22), 0.0, 0.4)
GLASS = lambda: mat('glass', (0.92, 0.97, 1.0), 0.0, 0.02, transmission=1.0)
AMBER_GLASS = lambda: mat('amber_glass', (0.55, 0.20, 0.04), 0.0, 0.03, transmission=0.9)
ROSE_GLASS = lambda: mat('rose_glass', (1.0, 0.55, 0.65), 0.0, 0.03, transmission=0.9)
MILK = lambda: mat('milk', (0.96, 0.90, 0.78), 0.0, 0.4)
PISTACHIO = lambda: mat('pistachio', (0.45, 0.65, 0.20), 0.0, 0.5)
SAFFRON = lambda: mat('saffron', (0.98, 0.42, 0.04), 0.0, 0.35)
ROSE = lambda: mat('rose', (0.92, 0.28, 0.45), 0.0, 0.4)
SUKKARI = lambda: mat('sukkari', (0.80, 0.42, 0.07), 0.0, 0.18, coat=0.6)
PASTRY = lambda: mat('pastry', (0.86, 0.55, 0.16), 0.0, 0.6)
SYRUP = lambda: mat('syrup', (0.10, 0.035, 0.01), 0.0, 0.1, coat=1.0)
CREAM = lambda: mat('cream', (0.98, 0.94, 0.82), 0.0, 0.5)
PURPLE = lambda: mat('purple', (0.30, 0.10, 0.55), 0.0, 0.45, coat=0.4)
CLOTH = lambda: mat('cloth', (0.035, 0.035, 0.045), 0.0, 0.85)
AGAR = lambda: mat('agarwood', (0.13, 0.065, 0.03), 0.0, 0.3, coat=0.5)
EMERALD = lambda: mat('emerald', (0.0, 0.55, 0.25), 0.0, 0.05, transmission=0.6)
RUBY = lambda: mat('ruby', (0.75, 0.02, 0.10), 0.0, 0.05, transmission=0.6)
SMOKE = lambda: mat('smoke', (1, 1, 1), 0.0, 1.0, alpha=0.28)
STEEL = lambda: mat('steel', (0.55, 0.58, 0.62), 1.0, 0.3)
TEAL = lambda: mat('teal', (0.10, 0.52, 0.48), 0.0, 0.35, coat=0.5)


def group(builder, loc=(0, 0, 0), scale=1.0, rot_z=0.0):
    """Run a builder, then parent everything it created under one transformed empty."""
    before = set(bpy.data.objects)
    builder()
    new = [o for o in bpy.data.objects if o not in before]
    e = bpy.data.objects.new('grp', None); bpy.context.collection.objects.link(e)
    for o in new:
        o.parent = e
    e.location = loc; e.scale = (scale,) * 3; e.rotation_euler = (0, 0, rot_z)
    return e


def smoke(x, y, z0, n=3, rise=0.22):
    for i in range(n):
        r = 0.16 + 0.05 * i
        sphere((x + 0.05 * math.sin(i * 1.7), y + 0.04 * math.cos(i), z0 + i * rise), (r, r, r * 0.8), SMOKE(), seg=16)


def scatter(cx, cy, z, radius, count, scale, material, seed=1, tilt=0.5, pile=0.0):
    random.seed(seed)
    for _ in range(count):
        r = radius * math.sqrt(random.random()); a = random.uniform(0, 6.283)
        zz = z + pile * (1 - r / radius)
        o = sphere((cx + r * math.cos(a), cy + r * math.sin(a), zz), scale, material, seg=16)
        o.rotation_euler = (random.uniform(-tilt, tilt), random.uniform(-tilt, tilt), random.uniform(0, 6.283))


def auto_frame(elev=28, azim=-28, margin=1.1):
    sc = bpy.context.scene
    for o in list(bpy.data.objects):
        if o.type == 'CURVE':
            bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
            bpy.ops.object.convert(target='MESH')
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in bpy.data.objects:
        if o.type != 'MESH':
            continue
        ev = o.evaluated_get(dg)
        pts += [ev.matrix_world @ Vector(c) for c in ev.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    center = (mn + mx) / 2
    e, a = math.radians(elev), math.radians(azim)
    direction = Vector((math.cos(e) * math.sin(a), -math.cos(e) * math.cos(a), math.sin(e)))
    cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'
    cam = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(cam)
    cam.location = center + direction * 30
    cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.view_layer.update()
    right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0)); up = cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
    xs = [(p - center).dot(right) for p in pts]; ys = [(p - center).dot(up) for p in pts]
    cam_d.ortho_scale = max(max(xs) - min(xs), max(ys) - min(ys)) * margin
    cam.location += right * ((max(xs) + min(xs)) / 2) + up * ((max(ys) + min(ys)) / 2)
    sc.camera = cam
    for loc, energy, size, col in [((-3, -4, 5), 380, 4, (1, 0.95, 0.88)), ((4, -2, 3), 160, 4, (1, 0.85, 0.65)), ((0, 4, 4), 140, 5, (0.8, 0.9, 1))]:
        ld = bpy.data.lights.new('l', 'AREA'); ld.energy = energy; ld.size = size; ld.color = col
        lo = bpy.data.objects.new('l', ld); lo.location = center + Vector(loc); bpy.context.collection.objects.link(lo)
        lo.rotation_euler = (center - lo.location).to_track_quat('-Z', 'Y').to_euler()


# ------------------------------------------------------------------ generators
def gen_qahwa():  # Khawlani coffee sack
    lathe([(0.0, 0.0), (0.62, 0.0), (0.85, 0.35), (0.8, 0.9), (0.55, 1.35), (0.34, 1.5), (0.0, 1.5)], BURLAP(), name='sack')
    torus((0, 0, 1.42), 0.36, 0.07, RED())
    lathe([(0.22, 1.45), (0.5, 1.7), (0.6, 1.95), (0.3, 1.8), (0.15, 1.5)], BURLAP(), name='flap')
    scatter(0, 0, 1.52, 0.28, 7, (0.13, 0.18, 0.09), GREEN_BEAN(), seed=4, pile=0.2)
    torus((0, 0, 0.7), 0.82, 0.03, RED())


def qahwa_1():  # green beans
    scatter(0, 0, 0.14, 0.8, 34, (0.2, 0.28, 0.14), GREEN_BEAN(), seed=2, pile=0.45)


def qahwa_2():  # blonde cardamom roast
    scatter(0, 0, 0.14, 0.8, 28, (0.2, 0.28, 0.14), TAN_BEAN(), seed=5, pile=0.4)
    for i, (x, y) in enumerate([(0.55, -0.55), (0.8, -0.2), (-0.7, -0.5)]):
        o = sphere((x, y, 0.2), (0.12, 0.3, 0.1), CARDAMOM(), seg=16); o.rotation_euler = (0, 0, 0.7 * i + 0.4)


def qahwa_3():  # brass mortar and mihmas (pestle)
    lathe([(0.0, 0.0), (0.4, 0.0), (0.5, 0.1), (0.42, 0.45), (0.78, 0.75), (0.82, 0.8), (0.72, 0.8), (0.34, 0.5), (0.0, 0.5)], BRASS(), name='mortar')
    p = cyl((0.3, 0.1, 1.05), 0.12, 1.5, BRASS(), rot=(0.0, 0.35, 0.0)); p.name = 'pestle'
    sphere((0.557, 0.1, 1.755), (0.2, 0.2, 0.2), BRASS())
    scatter(0, 0, 0.6, 0.3, 6, (0.12, 0.17, 0.09), TAN_BEAN(), seed=3, pile=0.1)


def qahwa_4():  # gilded raslan dallah
    A.build_dallah()


def qahwa_5():  # saffron finjan trio
    cyl((0, 0, 0.0), 1.3, 0.08, GOLD())
    for x in (-0.78, 0.0, 0.78):
        group(A.build_finjan, loc=(x, 0.12 * (1 - abs(x)) - 0.05, 0.04), scale=0.6)
    for i in range(6):
        sphere((-0.15 + 0.07 * i, -0.78 + 0.03 * (i % 2), 0.1), (0.05, 0.015, 0.012), SAFFRON(), seg=8).rotation_euler = (0, 0, 0.3 * i)


def qahwa_6():  # royal dallah and oud set
    cyl((0, 0, 0.0), 1.5, 0.1, RED())
    cyl((0, 0, 0.1), 1.36, 0.08, GOLD())
    group(A.build_dallah, loc=(-0.3, 0.15, 0.18), scale=0.72)
    group(A.build_finjan, loc=(0.78, -0.45, 0.18), scale=0.55)
    group(A.build_finjan, loc=(0.3, -0.85, 0.18), scale=0.55)
    group(A.build_mabkhara, loc=(0.85, 0.5, 0.18), scale=0.5)


# ------------------------------------------------------------------ barista
def gen_barista():  # specialty roaster
    box((0, 0, 0.8), (0.95, 0.7, 0.8), TEAL())
    cyl((0, -0.72, 0.95), 0.42, 0.18, STEEL(), rot=(math.pi / 2, 0, 0))
    cyl((0, -0.82, 0.95), 0.28, 0.06, COFFEE(), rot=(math.pi / 2, 0, 0))
    lathe([(0.0, 1.6), (0.3, 1.6), (0.7, 2.2), (0.6, 2.2), (0.0, 1.7)], STEEL(), name='hopper')
    cyl((0.55, -0.74, 0.45), 0.09, 0.05, BRASS(), rot=(math.pi / 2, 0, 0))
    cyl((-0.55, -0.74, 0.45), 0.09, 0.05, BRASS(), rot=(math.pi / 2, 0, 0))
    group(A.build_finjan, loc=(0, -1.0, 0.0), scale=0.35)


def barista_1():  # unbleached V60 filter
    lathe([(0.0, 0.0), (0.04, 0.0), (0.9, 1.5), (0.84, 1.5), (0.0, 0.05)], mat('paper', (0.84, 0.70, 0.46), 0.0, 0.9), name='filter')
    torus((0, 0, 1.5), 0.87, 0.04, mat('paper_edge', (0.78, 0.63, 0.40), 0.0, 0.9))


def barista_2():  # ceramic V60 dripper on a mug
    lathe([(0.0, 0.0), (0.7, 0.0), (0.78, 0.15), (0.75, 0.75), (0.65, 0.78), (0.0, 0.7)], WHITE(), name='mug')
    cyl((0, 0, 0.7), 0.64, 0.03, COFFEE())
    group(lambda: [lathe([(0.0, 0.0), (0.12, 0.0), (0.2, 0.05), (0.75, 0.9), (0.8, 1.0), (0.74, 1.0), (0.18, 0.12), (0.0, 0.12)], WHITE(), name='cone'),
                   torus((0, 0, 1.0), 0.78, 0.04, WHITE())], loc=(0, 0, 0.78), scale=0.95)
    curve_tube([(0.75, 0, 0.55), (1.15, 0, 0.5), (1.15, 0, 0.1), (0.75, 0, 0.12)], 0.07, WHITE())


def _tall_glass(r=0.55, h=1.9):
    lathe([(0.0, 0.0), (r * 0.85, 0.0), (r, 0.05), (r * 1.05, h), (r * 1.0, h), (r * 0.92, 0.12), (0.0, 0.1)], GLASS(), name='glass')


def barista_3():  # iced Riyadh spanish latte
    _tall_glass()
    cyl((0, 0, 0.42), 0.5, 0.6, COFFEE())
    cyl((0, 0, 1.12), 0.52, 0.8, MILK())
    for i, (x, y, z) in enumerate([(-0.15, 0.1, 1.7), (0.2, -0.1, 1.55), (0.0, 0.2, 1.4)]):
        o = box((x, y, z), (0.2, 0.2, 0.2), GLASS()); o.rotation_euler = (0.4 * i, 0.3, 0.5 * i)
    cyl((0.18, 0.1, 1.45), 0.05, 2.1, RED(), rot=(0.12, 0.1, 0))


def barista_4():  # camel-milk pistachio cortado
    lathe([(0.0, 0.0), (0.4, 0.0), (0.44, 0.04), (0.5, 0.75), (0.46, 0.75), (0.38, 0.1), (0.0, 0.08)], GLASS(), name='gibraltar')
    cyl((0, 0, 0.3), 0.4, 0.5, COFFEE())
    cyl((0, 0, 0.58), 0.42, 0.28, MILK())
    scatter(0, 0, 0.74, 0.3, 14, (0.06, 0.05, 0.04), PISTACHIO(), seed=8)
    lathe([(0.0, -0.02), (0.8, 0.0), (1.0, 0.1), (0.94, 0.12), (0.0, 0.08)], WHITE(), name='saucer').location.z = -0.02


def barista_5():  # Taif rose chemex cold brew
    lathe([(0.0, 0.0), (0.7, 0.0), (0.75, 0.05), (0.2, 0.95), (0.18, 1.0), (0.2, 1.05), (0.75, 1.95), (0.8, 2.0), (0.74, 2.0), (0.14, 1.0), (0.14, 0.96), (0.68, 0.08), (0.0, 0.06)], GLASS(), name='chemex')
    lathe([(0.0, 0.05), (0.66, 0.06), (0.4, 0.5), (0.2, 0.9), (0.0, 0.9)], COFFEE(), name='brew')
    lathe([(0.18, 0.88), (0.26, 0.88), (0.3, 1.2), (0.2, 1.2)], WOOD(), name='collar_stub')
    torus((0, 0, 1.0), 0.23, 0.1, WOOD())
    curve_tube([(0.0, 0, 1.0), (0.0, 0.0, 1.0)], 0.001, WOOD()) if False else None
    for i in range(6):
        a = i * 1.047
        o = sphere((0.45 * math.cos(a), 0.45 * math.sin(a), 1.88), (0.16, 0.12, 0.03), ROSE(), seg=12); o.rotation_euler = (0.2, 0, a)
    sphere((0, 0, 1.9), (0.14, 0.14, 0.08), ROSE(), seg=12)


def barista_6():  # grand roastery flight
    box((0, 0, 0.1), (1.9, 0.62, 0.1), WOOD())
    shades = [(0.05, 0.02, 0.01), (0.2, 0.09, 0.03), (0.45, 0.25, 0.1), (0.9, 0.82, 0.65)]
    for i, c in enumerate(shades):
        x = -1.35 + i * 0.9
        lathe([(0.0, 0.0), (0.26, 0.0), (0.34, 0.6), (0.3, 0.6), (0.22, 0.05), (0.0, 0.04)], GLASS(), name='flightglass').location = (x, 0, 0.2)
        cyl((x, 0, 0.45), 0.26, 0.5, mat('flight%d' % i, c, 0.0, 0.1, coat=0.6))
    sphere((1.55, -0.45, 0.28), (0.14, 0.14, 0.1), ROSE(), seg=12)


# ------------------------------------------------------------------ sweets
def gen_sweets():  # AlUla date basket
    lathe([(0.0, 0.0), (0.8, 0.0), (1.1, 0.8), (1.0, 0.85), (0.0, 0.8)], mat('wicker', (0.62, 0.42, 0.20), 0.0, 0.8), name='basket')
    for z in (0.2, 0.45, 0.7):
        torus((0, 0, z), 0.8 + 0.3 * z, 0.035, mat('wicker_band', (0.45, 0.28, 0.12), 0.0, 0.8))
    curve_tube([(-1.0, 0, 0.8), (-0.8, 0, 1.9), (0.8, 0, 1.9), (1.0, 0, 0.8)], 0.07, mat('wicker_h', (0.5, 0.32, 0.14), 0.0, 0.8))
    scatter(0, 0, 0.88, 0.8, 16, (0.28, 0.18, 0.16), DATE(), seed=6, pile=0.35)


def sweets_1():  # fresh sukkari rutab
    sphere((0, 0, -0.01), (1.2, 0.5, 0.02), mat('leaf', (0.18, 0.4, 0.12), 0.0, 0.5), seg=24)
    for i, (x, y) in enumerate([(-0.5, 0.0), (0.4, 0.2), (0.05, -0.4)]):
        o = sphere((x, y, 0.2), (0.34, 0.22, 0.2), SUKKARI(), seg=24); o.rotation_euler = (0, 0, 0.6 * i + 0.3)


def sweets_2():  # tahini and almond stuffed dates
    for i, (x, y) in enumerate([(-0.55, 0.0), (0.5, 0.15), (0.0, -0.5)]):
        o = sphere((x, y, 0.2), (0.4, 0.26, 0.2), DATE(), seg=24); o.rotation_euler = (0, 0, 0.5 * i)
        sphere((x, y, 0.37), (0.28, 0.14, 0.08), CREAM(), seg=16).rotation_euler = (0, 0, 0.5 * i)
        sphere((x, y, 0.45), (0.14, 0.07, 0.05), mat('almond', (0.72, 0.5, 0.28), 0.0, 0.5), seg=12).rotation_euler = (0, 0, 0.5 * i + 0.8)


def sweets_3():  # kleija and pistachio maamoul
    cyl((0, 0, 0.0), 1.3, 0.05, WHITE())
    for x, y in [(-0.55, 0.3), (0.5, 0.35)]:
        cyl((x, y, 0.18), 0.42, 0.28, PASTRY())
        sphere((x, y, 0.3), (0.42, 0.42, 0.18), PASTRY())
        torus((x, y, 0.3), 0.22, 0.03, mat('mamoul_p', (0.62, 0.38, 0.10), 0.0, 0.6))
    for x, y in [(0.0, -0.55), (-0.75, -0.55)]:
        torus((x, y, 0.16), 0.34, 0.14, PASTRY())
    scatter(0.2, -0.3, 0.32, 0.5, 8, (0.06, 0.05, 0.04), PISTACHIO(), seed=11)


def sweets_4():  # luqaimat and date syrup
    cyl((0, 0, 0.0), 1.2, 0.05, WHITE())
    scatter(0, 0, 0.28, 0.7, 13, (0.28, 0.28, 0.26), PASTRY(), seed=12, pile=0.55)
    for i in range(5):
        sphere((0.35 * math.cos(i * 1.3), 0.3 * math.sin(i * 1.3), 0.95 - 0.12 * i), (0.15, 0.1, 0.07), SYRUP(), seg=12)
    lathe([(0.0, 0.0), (0.2, 0.0), (0.28, 0.35), (0.24, 0.35), (0.0, 0.05)], WHITE(), name='syrup_bowl').location = (1.0, -0.5, 0.05)
    cyl((1.0, -0.5, 0.25), 0.2, 0.03, SYRUP())


def sweets_5():  # saffron and rose tres leches
    cyl((0, 0, 0.0), 1.3, 0.05, WHITE())
    box((0, 0, 0.45), (0.78, 0.6, 0.4), CREAM())
    box((0, 0, 0.5), (0.8, 0.62, 0.07), mat('milk_layer', (0.99, 0.97, 0.9), 0.0, 0.3))
    box((0, 0, 0.88), (0.8, 0.62, 0.06), SAFFRON())
    for i in range(5):
        a = i * 1.26
        o = sphere((0.25 * math.cos(a), 0.2 * math.sin(a), 0.98), (0.15, 0.1, 0.03), ROSE(), seg=12); o.rotation_euler = (0.2, 0, a)
    scatter(0, 0, 0.95, 0.5, 6, (0.05, 0.04, 0.04), PISTACHIO(), seed=13)


def sweets_6():  # royal golden kunafa tower
    cyl((0, 0, 0.0), 1.45, 0.1, GOLD())
    for i, (r, z) in enumerate([(1.1, 0.35), (0.8, 0.8), (0.52, 1.2)]):
        lathe([(0.0, 0.0), (r, 0.0), (r * 1.04, 0.2), (r, 0.4), (0.0, 0.42)], PASTRY(), name='tier').location.z = z - 0.2
        torus((0, 0, z - 0.02), r * 1.02, 0.03, GOLD())
    scatter(0, 0, 1.65, 0.38, 10, (0.07, 0.06, 0.05), PISTACHIO(), seed=14, pile=0.1)
    sphere((0, 0, 1.75), (0.16, 0.16, 0.08), ROSE(), seg=12)


# ------------------------------------------------------------------ oud
def gen_oud():  # perfumery chest with mabkhara
    box((0, 0, 0.5), (1.05, 0.7, 0.5), PURPLE())
    box((0, 0, 1.02), (1.1, 0.74, 0.06), GOLD())
    for x in (-0.8, 0.8):
        box((x, 0, 0.5), (0.07, 0.72, 0.52), GOLD())
    box((0, -0.72, 0.65), (0.14, 0.04, 0.16), GOLD())
    group(A.build_mabkhara, loc=(0, 0, 1.08), scale=0.55)


def oud_1():  # raw agarwood chips: irregular low-poly shards with a resin sheen
    random.seed(21)
    m = mat('agarwood', (0.07, 0.035, 0.018), 0.0, 0.25, coat=0.7)
    for i in range(11):
        x, y = random.uniform(-0.8, 0.8), random.uniform(-0.6, 0.6)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0, location=(x, y, 0.1 + 0.08 * (i % 3)))
        o = bpy.context.object; assign(o, m)
        o.scale = (random.uniform(0.2, 0.4), random.uniform(0.1, 0.26), random.uniform(0.06, 0.13))
        o.rotation_euler = (random.uniform(-.6, .6), random.uniform(-.6, .6), random.uniform(0, 3.1))
    for i in range(4):  # golden resin beads
        sphere((random.uniform(-0.5, 0.5), random.uniform(-0.4, 0.4), 0.3), (0.07, 0.07, 0.06), mat('resin', (0.75, 0.45, 0.08), 0.0, 0.15, coat=1.0), seg=12)


def oud_2():  # brass mabkhara with smoke
    A.build_mabkhara()
    smoke(0.0, 0.0, 1.45, n=3)


def _bottle(body, liquid, cap, h=1.5, r=0.55):
    lathe([(0.0, 0.0), (r, 0.0), (r * 1.1, 0.12), (r * 1.1, h * 0.55), (r * 0.6, h * 0.8), (0.2, h * 0.86), (0.2, h), (0.0, h)], body, name='bottle')
    lathe([(0.0, 0.04), (r * 0.95, 0.08), (r * 1.02, h * 0.5), (r * 0.55, h * 0.74), (0.0, h * 0.74)], liquid, name='liquid')
    lathe([(0.0, h), (0.24, h), (0.24, h + 0.14), (0.0, h + 0.14)], cap, name='neck')


def oud_3():  # Taif rose crystal tola
    _bottle(GLASS(), ROSE_GLASS(), GOLD(), h=1.3, r=0.5)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.3, location=(0, 0, 1.78)); st = bpy.context.object
    assign(st, GLASS()); st.scale = (1, 1, 1.2)


def oud_4():  # aged royal dahn al-oud
    _bottle(AMBER_GLASS(), mat('dahn', (0.35, 0.12, 0.02), 0.0, 0.1, coat=1.0), GOLD(), h=1.55, r=0.52)
    torus((0, 0, 0.62), 0.58, 0.05, GOLD())
    torus((0, 0, 1.2), 0.38, 0.04, GOLD())
    sphere((0, 0, 1.86), (0.2, 0.2, 0.2), GOLD())
    box((0, -0.54, 0.5), (0.2, 0.02, 0.28), CREAM())


def oud_5():  # gilded Diriyah incense tower (Najdi tiers)
    cyl((0, 0, 0.0), 1.0, 0.12, GOLD())
    for i, (r, h) in enumerate([(0.85, 0.9), (0.66, 0.8), (0.48, 0.7)]):
        z0 = 0.1 + sum(hh for _, hh in [(0.85, 0.9), (0.66, 0.8), (0.48, 0.7)][:i])
        lathe([(0.0, 0.0), (r, 0.0), (r * 0.9, h), (0.0, h)], mat('tower%d' % i, (0.88, 0.62, 0.14), 1.0, 0.3), name='tier').location.z = z0
        for k in range(8):
            a = k * math.pi / 4
            box((r * 0.78 * math.cos(a), r * 0.78 * math.sin(a), z0 + h + 0.02), (0.08, 0.08, 0.1), GOLD()).rotation_euler = (0, 0, a)
        box((0, -r * 0.88, z0 + h * 0.5), (0.1, 0.03, 0.2), mat('window', (0.05, 0.02, 0.01), 0.0, 0.5))
    smoke(0, 0, 2.5, n=2)


def oud_6():  # royal bisht and rare oud ceremony
    box((0, 0, 0.12), (1.25, 0.85, 0.12), CLOTH())
    for sy in (-1, 1):
        box((0, sy * 0.82, 0.25), (1.27, 0.035, 0.015), GOLD())
    for sx in (-1, 1):
        box((sx * 1.22, 0, 0.25), (0.035, 0.85, 0.015), GOLD())
    box((0, 0, 0.25), (1.25, 0.1, 0.012), GOLD())
    group(A.build_mabkhara, loc=(-0.6, 0.05, 0.26), scale=0.58)
    group(lambda: _bottle(AMBER_GLASS(), mat('dahn', (0.35, 0.12, 0.02), 0.0, 0.1, coat=1.0), GOLD(), h=1.2, r=0.4), loc=(0.5, 0.05, 0.26), scale=0.85)
    for i in range(3):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0, location=(0.0 + 0.2 * i, -0.55, 0.32))
        o = bpy.context.object; assign(o, AGAR()); o.scale = (0.13, 0.08, 0.05); o.rotation_euler = (0.3, 0.2, 0.7 * i)


# ------------------------------------------------------------------ chests
def chest_1():  # wooden Sadu hospitality chest
    A.build_chest()


def chest_2():  # gilded royal treasure chest
    box((0, 0, 0.45), (1.0, 0.65, 0.45), GOLD())
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.65, depth=2.0, location=(0, 0, 0.9), rotation=(0, math.pi / 2, 0))
    lid = bpy.context.object; bpy.ops.object.shade_smooth(); assign(lid, GOLD())
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0.5)); cut = bpy.context.object; cut.scale = (1.2, 0.8, 0.5)
    md = lid.modifiers.new('bool', 'BOOLEAN'); md.object = cut; md.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = lid; bpy.ops.object.modifier_apply(modifier='bool'); bpy.data.objects.remove(cut)
    for x in (-0.75, 0.0, 0.75):
        box((x, 0, 0.45), (0.07, 0.68, 0.47), WOOD())
        cyl((x, 0, 0.9), 0.68, 0.12, WOOD(), rot=(0, math.pi / 2, 0))
    box((0, -0.66, 0.78), (0.16, 0.05, 0.18), RED())
    for i, (x, m) in enumerate([(-0.5, EMERALD), (0.0, RUBY), (0.5, EMERALD)]):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.13, location=(x, 0.0, 1.58)); assign(bpy.context.object, m())
    for i in range(7):
        c = cyl((-0.6 + 0.2 * i, -0.15 + 0.1 * (i % 2), 1.55 - 0.02 * i), 0.12, 0.03, GOLD(), rot=(0.5, 0.2 * i, 0))


FLAT = {'qahwa_1', 'qahwa_2', 'qahwa_5', 'qahwa_6', 'sweets_1', 'sweets_2', 'sweets_3', 'sweets_4', 'sweets_5', 'oud_1', 'oud_6', 'barista_6', 'barista_1'}
FLAT_ELEV = 44

ITEMS = [gen_qahwa, qahwa_1, qahwa_2, qahwa_3, qahwa_4, qahwa_5, qahwa_6,
         gen_barista, barista_1, barista_2, barista_3, barista_4, barista_5, barista_6,
         gen_sweets, sweets_1, sweets_2, sweets_3, sweets_4, sweets_5, sweets_6,
         gen_oud, oud_1, oud_2, oud_3, oud_4, oud_5, oud_6, chest_1, chest_2]

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    only = os.environ.get('ONLY')
    for fn in ITEMS:
        if only and fn.__name__ not in only.split(','):
            continue
        reset()
        ramp = [n for n in bpy.context.scene.world.node_tree.nodes if n.type == 'VALTORGB'][0]
        ramp.color_ramp.elements[0].color = (0.34, 0.21, 0.11, 1)  # lift the dark floor so metals read bright at icon size
        fn()
        auto_frame(elev=FLAT_ELEV if fn.__name__ in FLAT else 28)
        A.render(fn.__name__)
