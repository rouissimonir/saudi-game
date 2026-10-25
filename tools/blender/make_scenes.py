"""Portrait backdrops for the animated story scenes, rendered with Blender (bpy) in the same chunky style.

Each scene renders two layers for parallax: bg_<scene>.png (sky, ground and far set) and bg_<scene>_fg.png
(near set pieces on a transparent background). Characters stand over the lower third, so that area stays calm.

    SAMPLES=32 ONLY=street python tools/blender/make_scenes.py -- public/assets/art/story
"""
import math, os, random, sys
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_art as A  # noqa: E402
from make_art import mat, sphere, cyl, box, curve_tube, BRASS, COPPER, WOOD, RED  # noqa: E402

W, H = int(os.environ.get('SCENE_W', '1080')), int(os.environ.get('SCENE_H', '1920'))
MUD = lambda: mat('mud', (0.62, 0.40, 0.22), 0.0, 0.92)
MUD_DARK = lambda: mat('mud_dark', (0.46, 0.28, 0.15), 0.0, 0.95)
GYPSUM = lambda: mat('gypsum', (0.95, 0.91, 0.82), 0.0, 0.8)
SHADOW = lambda: mat('window', (0.06, 0.03, 0.02), 0.0, 0.9)
SAND = lambda: mat('sand', (0.78, 0.58, 0.36), 0.0, 1.0)
PALM_TRUNK = lambda: mat('palm_trunk', (0.30, 0.18, 0.09), 0.0, 0.9)
PALM_LEAF = lambda: mat('palm_leaf', (0.18, 0.36, 0.14), 0.0, 0.7)


def sky(bottom, top, strength=1.0):
    s = bpy.context.scene
    nt = s.world.node_tree
    ramp = [n for n in nt.nodes if n.type == 'VALTORGB'][0]
    # The world's Generated Z is the view direction's height (0 at the horizon, 1 straight up): warm at the
    # horizon, dusk purple by ~20 degrees, which is roughly the top of a portrait frame.
    ramp.color_ramp.elements[0].position = 0.02; ramp.color_ramp.elements[0].color = (*bottom, 1)
    ramp.color_ramp.elements[1].position = 0.32; ramp.color_ramp.elements[1].color = (*top, 1)
    nt.nodes['Background'].inputs[1].default_value = strength


def najdi_house(x, y, w, h, d=3.0, seed=0, door=False):
    """Mud-brick house: tapered walls, white triangular crenellations, triangular vents and a carved door."""
    rnd = random.Random(seed)
    box((x, y, h / 2), (w / 2, d / 2, h / 2), MUD() if seed % 2 else MUD_DARK())
    n = max(3, int(w / 0.9))
    for i in range(n):  # crenellations
        cx = x - w / 2 + (i + 0.5) * w / n
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.32, depth=0.6, location=(cx, y - d / 2 + 0.2, h + 0.28))
        c = bpy.context.object; c.rotation_euler = (0, 0, math.pi / 4); A.assign(c, GYPSUM())
    for row in range(max(1, int(h / 3.2))):  # triangular vents
        zz = h - 1.2 - row * 2.6
        for k in range(max(1, int(w / 2.4))):
            vx = x - w / 2 + 1.0 + k * 2.2 + rnd.uniform(-0.2, 0.2)
            if vx > x + w / 2 - 0.6:
                continue
            bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.28, depth=0.12, location=(vx, y - d / 2 - 0.02, zz))
            v = bpy.context.object; v.rotation_euler = (math.pi / 2, 0, 0); A.assign(v, SHADOW())
    box((x, y - d / 2 + 0.05, h - 0.35), (w / 2 + 0.05, 0.08, 0.08), GYPSUM())  # white band under the parapet
    if door:
        box((x, y - d / 2 - 0.05, 1.3), (0.75, 0.1, 1.3), WOOD())
        for k in range(3):
            box((x, y - d / 2 - 0.16, 0.6 + k * 0.8), (0.6, 0.02, 0.04), mat('door_stud', (0.75, 0.55, 0.2), 1.0, 0.35))


def palm(x, y, height=7.0, lean=0.4, seed=0):
    rnd = random.Random(seed)
    top = Vector((x + lean, y, height))
    curve_tube([(x, y, 0), (x + lean * 0.3, y, height * 0.5), tuple(top)], 0.22, PALM_TRUNK(), radii=[1.3, 1.0, 0.8])
    for i in range(9):
        a = i / 9 * math.tau + rnd.uniform(-0.2, 0.2)
        tip = top + Vector((math.cos(a) * 2.6, math.sin(a) * 2.6, -1.4 + rnd.uniform(-0.3, 0.3)))
        mid = top + Vector((math.cos(a) * 1.5, math.sin(a) * 1.5, 0.35))
        curve_tube([tuple(top), tuple(mid), tuple(tip)], 0.16, PALM_LEAF(), radii=[0.8, 1.6, 0.3])


def portrait_camera(target, dist, elev, azim=0.0, lens=40):
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = W, H
    cd = bpy.data.cameras.new('cam'); cd.lens = lens; cd.sensor_fit = 'VERTICAL'
    cam = bpy.data.objects.new('cam', cd); bpy.context.collection.objects.link(cam)
    t = Vector(target); e, a = math.radians(elev), math.radians(azim)
    cam.location = t + Vector((dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), dist * math.sin(e)))
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    s.camera = cam


def sun(direction_deg=(62, 0, -35), color=(1.0, 0.62, 0.35), energy=3.2):
    ld = bpy.data.lights.new('sun', 'SUN'); ld.energy = energy; ld.color = color; ld.angle = math.radians(4)
    lo = bpy.data.objects.new('sun', ld); bpy.context.collection.objects.link(lo)
    lo.rotation_euler = tuple(math.radians(v) for v in direction_deg)


def layered_render(name, fg_objects):
    """Render the full scene without fg objects (opaque sky), then only the fg objects on transparency."""
    s = bpy.context.scene
    for o in fg_objects:
        o.hide_render = True
    s.render.film_transparent = False
    A.render(f'bg_{name}')
    for o in bpy.data.objects:
        if o.type == 'MESH' or o.type == 'CURVE':
            o.hide_render = o not in fg_objects
    for o in fg_objects:
        o.hide_render = False
    s.render.film_transparent = True
    A.render(f'bg_{name}_fg')


def new_objects(before):
    return [o for o in bpy.data.objects if o not in before]


def street():
    """Dusk over At-Turaif: a lane between Najdi houses rising to the ruins on the ridge."""
    A.reset()
    sky((0.98, 0.55, 0.30), (0.30, 0.20, 0.42), 1.1)
    box((0, 10, -0.5), (40, 40, 0.5), SAND())
    for i, (x, y, w, h) in enumerate([(-9, 6, 6, 7), (-3.5, 12, 5, 9), (2.5, 16, 7, 11), (8.5, 9, 5, 8), (-12, 18, 6, 10), (12, 20, 7, 12)]):
        najdi_house(x, y, w, h, d=4, seed=i, door=(i == 2))
    for x, y in [(-6, 22), (5, 26), (14, 14)]:
        palm(x, y, 8.5, 0.5, seed=x)
    before = list(bpy.data.objects)
    najdi_house(-9.5, -1.0, 4.0, 12, d=2, seed=11)  # near walls framing the lane
    najdi_house(9.5, -0.5, 4.0, 13, d=2, seed=12)
    palm(-7.2, -3.0, 9.5, 0.9, seed=3)
    fg = new_objects(before)
    sphere((3.0, 120, 24), (5, 5, 5), mat('sun_disk', (1.0, 0.75, 0.4), 0.0, 0.5, emission=(1.0, 0.72, 0.35)))  # low setting sun
    sun((70, 0, -40), (1.0, 0.58, 0.32), 3.0)
    portrait_camera((0, 10, 7.5), 30.0, 4, 0, 30)
    layered_render('street', fg)


def courtyard():
    """The family Majlis courtyard, crumbling: cracked walls, fallen bricks, a dry fountain and an old door."""
    A.reset()
    sky((0.95, 0.60, 0.36), (0.36, 0.24, 0.40), 1.0)
    box((0, 6, -0.5), (30, 30, 0.5), mat('court_floor', (0.70, 0.52, 0.34), 0.0, 1.0))
    najdi_house(0, 9.5, 16, 8, d=1.5, seed=4, door=True)  # back wall with the Majlis door
    najdi_house(-8.5, 4, 1.5, 7, d=12, seed=5)
    najdi_house(8.5, 4, 1.5, 7, d=12, seed=6)
    crack = SHADOW()
    for x, z, rot in [(-4.5, 5.5, 0.6), (3.8, 4.2, -0.4), (5.6, 6.3, 0.9), (-2.4, 2.6, -0.7)]:  # cracks in the back wall
        c = box((x, 8.7, z), (0.05, 0.02, 0.9), crack); c.rotation_euler = (0, rot, 0)
        box((x + 0.35 * math.sin(rot), 8.7, z - 0.8), (0.04, 0.02, 0.45), crack).rotation_euler = (0, -rot, 0)
    box((2.0, 8.7, 7.4), (1.2, 0.3, 0.6), mat('hole', (0.25, 0.14, 0.08), 0.0, 1.0))  # broken parapet
    cyl((0, 3.5, 0.35), 1.6, 0.7, MUD())  # dry fountain
    cyl((0, 3.5, 0.72), 1.3, 0.08, mat('dry', (0.52, 0.38, 0.24), 0.0, 1.0))
    rnd = random.Random(7)
    before = list(bpy.data.objects)
    for _ in range(16):  # fallen bricks in the foreground corners
        x = rnd.choice([-1, 1]) * rnd.uniform(3.0, 6.0)
        b = box((x, rnd.uniform(1.0, 4.0), 0.18), (0.42, 0.24, 0.16), MUD_DARK())
        b.rotation_euler = (0, 0, rnd.uniform(0, math.pi))
    najdi_house(-7.8, 0.5, 2.6, 9.0, d=1.2, seed=13)
    fg = new_objects(before)
    sun((60, 0, 30), (1.0, 0.66, 0.40), 2.8)
    portrait_camera((0, 6.0, 6.0), 24.0, 6, 0, 30)
    layered_render('courtyard', fg)


def dallah():
    """Close-up: grandfather's brass dallah on a Sadu cloth, warm out-of-focus lights behind."""
    A.reset()
    sky((0.30, 0.15, 0.08), (0.10, 0.05, 0.04), 0.6)
    s = bpy.context.scene
    box((0, 0, -0.06), (6, 6, 0.06), mat('table', (0.24, 0.12, 0.05), 0.0, 0.4, coat=0.4))
    cloth = box((0, 0, 0.01), (2.6, 1.8, 0.02), RED())
    for k in range(-5, 6):
        box((k * 0.45, 0, 0.035), (0.08, 1.75, 0.01), mat(f'sadu_{k % 3}', [(0.95, 0.85, 0.6), (0.08, 0.06, 0.05), (0.85, 0.55, 0.12)][k % 3], 0.0, 0.8))
    A.build_dallah()
    for i in range(8):  # lantern bokeh far behind
        sphere((-5 + i * 1.5, 9 + (i % 3), 2.5 + (i % 2) * 1.2), (0.25, 0.25, 0.25), mat(f'lamp{i}', (1, 0.7, 0.3), 0.0, 0.5, emission=(1, 0.65, 0.25)))
    for loc, energy in [((-3, -4, 5), 600), ((4, -2, 3), 260), ((0, 4, 4), 300)]:
        ld = bpy.data.lights.new('l', 'AREA'); ld.energy = energy; ld.size = 4; ld.color = (1, 0.88, 0.7)
        lo = bpy.data.objects.new('l', ld); lo.location = loc; bpy.context.collection.objects.link(lo)
        lo.rotation_euler = (Vector((0, 0, 1.2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    portrait_camera((0, 0, 1.6), 13.0, 12, -12, 50)
    s.camera.data.dof.use_dof = True; s.camera.data.dof.focus_distance = 13.0; s.camera.data.dof.aperture_fstop = 2.2
    s.render.film_transparent = False
    A.render('bg_dallah')


SCENES = {'street': street, 'courtyard': courtyard, 'dallah': dallah}

if __name__ == '__main__':
    os.makedirs(A.OUT, exist_ok=True)
    only = os.environ.get('ONLY')
    for name, fn in SCENES.items():
        if not only or name in only.split(','):
            fn()
