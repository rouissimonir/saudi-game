"""Renders the six character portraits (256px transparent PNG) as stylized 3D busts with Blender.

    SAMPLES=64 SIZE=256 ONLY=noura,tariq python make_characters.py -- public/assets/art/characters
"""
import math, os, sys
import bpy
from mathutils import Vector

os.environ.setdefault('SIZE', '256')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_art as A  # noqa: E402
from make_art import reset, mat, assign, lathe, sphere, cyl, box, torus, curve_tube  # noqa: E402

OUT = A.OUT
GOLD = lambda: mat('gold', (0.95, 0.68, 0.14), 1.0, 0.25)
BLACK_GLOSS = lambda: mat('black_gloss', (0.01, 0.01, 0.015), 0.0, 0.12, coat=1.0)
WHITE_CLOTH = lambda: mat('white_cloth', (0.96, 0.95, 0.92), 0.0, 0.9)
BLACK_CLOTH = lambda: mat('black_cloth', (0.03, 0.03, 0.04), 0.0, 0.85)


def skin(color):
    m = mat('skin', color, 0.0, 0.5)
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Subsurface Weight'].default_value = 0.25
    b.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.25)
    return m


def checker(c1, c2, scale=38):
    m = bpy.data.materials.new('checker'); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = 0.9
    tc = nt.nodes.new('ShaderNodeTexCoord'); ck = nt.nodes.new('ShaderNodeTexChecker')
    ck.inputs['Color1'].default_value = (*c1, 1); ck.inputs['Color2'].default_value = (*c2, 1); ck.inputs['Scale'].default_value = scale
    nt.links.new(tc.outputs['UV'], ck.inputs['Vector']); nt.links.new(ck.outputs['Color'], b.inputs['Base Color'])
    return m


def cut(obj, loc, size):
    """Boolean-subtract a box from obj (used to open the face area in headwear and hair)."""
    bpy.ops.mesh.primitive_cube_add(location=loc); c = bpy.context.object; c.scale = size
    md = obj.modifiers.new('cut', 'BOOLEAN'); md.object = c; md.operation = 'DIFFERENCE'; md.solver = 'EXACT'
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier='cut'); bpy.data.objects.remove(c)
    return obj


def head(skin_color, ear=True):
    s = skin(skin_color)
    h = sphere((0, 0, 0), (1.0, 0.92, 1.05), s, seg=48)
    cyl((0, 0.05, -1.0), 0.42, 0.9, s)
    if ear:
        for sx in (-1, 1):
            sphere((sx * 0.98, 0.02, -0.05), (0.1, 0.15, 0.2), s, seg=16)
    sphere((0, -0.92, -0.1), (0.13, 0.12, 0.15), s, seg=16)  # nose
    return h


def face(brow=0.1, brow_color=(0.05, 0.03, 0.02), lips=None, blush=True, lashes=False, smile=0.24):
    eye = BLACK_GLOSS()
    for sx in (-1, 1):
        sphere((sx * 0.37, -0.86, 0.1), (0.12, 0.07, 0.17), eye, seg=20)
        sphere((sx * 0.34, -0.91, 0.17), (0.04, 0.025, 0.045), mat('catch', (1, 1, 1), 0.0, 0.3, emission=(1, 1, 1)), seg=10)
        b = sphere((sx * 0.37, -0.84, 0.4), (0.19, 0.05, 0.045 + brow * 0.2), mat('brow', brow_color, 0.0, 0.8), seg=14)
        b.rotation_euler = (0, sx * -0.12, 0)
        if lashes:
            curve_tube([(sx * 0.2, -0.9, 0.27), (sx * 0.38, -0.92, 0.3), (sx * 0.55, -0.88, 0.22)], 0.018, BLACK_GLOSS())
        if blush:
            sphere((sx * 0.55, -0.8, -0.2), (0.15, 0.03, 0.09), mat('blush', (0.92, 0.45, 0.40), 0.0, 0.8), seg=12)
    mouth = lips or mat('mouth', (0.45, 0.14, 0.12), 0.0, 0.5)
    curve_tube([(-0.2, -0.9, -0.38), (0.0, -0.95, -0.38 - smile * 0.5), (0.2, -0.9, -0.38)], 0.032 if not lips else 0.05, mouth)


def shoulders(color, wide=1.6, z=-1.75, trim=None):
    sphere((0, 0.1, z), (wide, 0.85, 0.85), color, seg=40)
    if trim:
        for sx in (-1, 1):
            b = box((sx * 0.3, -0.72, z + 0.22), (0.045, 0.03, 0.62), trim); b.rotation_euler = (0, sx * 0.28, 0)


def gulf_headwear(cloth, agal=True, drape=True, face_cut_y=-0.32, face_cut_z=0.6):
    d = sphere((0, 0.12, 0.12), (1.13, 1.08, 1.0), cloth, seg=48)
    cut(d, (0, face_cut_y - 1.0, face_cut_z - 1.4), (2.0, 1.0, 1.4))
    if drape:
        for sx in (-1, 1):
            f = sphere((sx * 1.0, 0.24, -0.85), (0.27, 0.45, 0.85), cloth, seg=24); f.rotation_euler = (0, sx * 0.12, 0)
    if agal:
        torus((0, 0.08, 0.72), 1.0, 0.075, BLACK_GLOSS()); torus((0, 0.08, 0.57), 1.02, 0.06, BLACK_GLOSS())


def beard(material, width=0.9, depth=0.76, z=-0.72, height=0.5, mustache=0.32):
    """Jaw-hugging beard with an opening for the mouth, plus moustache and sideburns."""
    b = sphere((0, -0.22, z), (width, depth, height), material, seg=40)
    cut(b, (0, -1.25, -0.36), (0.42, 0.45, 0.2))
    sphere((0, -0.9, -0.27), (mustache, 0.07, 0.07), material, seg=16)
    for sx in (-1, 1):
        sphere((sx * 0.86, -0.25, -0.28), (0.15, 0.3, 0.5), material, seg=16)


def portrait_stage(center=(0, 0, -0.45), dist=11.0, lens=85, elev=3, azim=-9):
    s = bpy.context.scene
    cd = bpy.data.cameras.new('cam'); cd.lens = lens
    cam = bpy.data.objects.new('cam', cd); bpy.context.collection.objects.link(cam)
    t = Vector(center); e, a = math.radians(elev), math.radians(azim)
    cam.location = t + Vector((dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), dist * math.sin(e)))
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    s.camera = cam
    for loc, energy, size, col in [((-3, -5, 4), 520, 4, (1, 0.95, 0.88)), ((4, -4, 1), 210, 4, (1, 0.85, 0.65)), ((0, 5, 4), 300, 5, (1, 0.9, 0.8))]:
        ld = bpy.data.lights.new('l', 'AREA'); ld.energy = energy; ld.size = size; ld.color = col
        lo = bpy.data.objects.new('l', ld); lo.location = loc; bpy.context.collection.objects.link(lo)
        lo.rotation_euler = (t - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


# ------------------------------------------------------------------ characters
def noura():  # grandmother: maroon headscarf, glasses, grey fringe, black abaya with gold trim
    head((0.86, 0.66, 0.52))
    face(brow=0.05, brow_color=(0.55, 0.52, 0.5), smile=0.3)
    shoulders(BLACK_CLOTH(), trim=GOLD())
    scarf = mat('scarf', (0.38, 0.06, 0.10), 0.0, 0.7)
    gulf_headwear(scarf, agal=False, face_cut_y=-0.25, face_cut_z=0.62)
    for sx in (-1, 1):
        sphere((sx * 0.5, -0.74, 0.62), (0.3, 0.12, 0.13), mat('grey_hair', (0.8, 0.8, 0.82), 0.0, 0.6), seg=16)
    torus((0, 0.08, 0.7), 1.03, 0.04, GOLD())
    for sx in (-1, 1):  # round gold glasses
        g = torus((sx * 0.37, -0.93, 0.1), 0.25, 0.028, GOLD(), rot=(math.pi / 2, 0, 0))
        curve_tube([(sx * 0.62, -0.85, 0.1), (sx * 0.95, -0.4, 0.08), (sx * 1.0, 0.0, 0.0)], 0.02, GOLD())
    cyl((0, -0.94, 0.12), 0.02, 0.2, GOLD(), rot=(0, math.pi / 2, 0))


def faisal():  # barista: dark hair + quiff, trimmed beard, teal shirt, leather apron
    head((0.80, 0.60, 0.46))
    face(brow=0.15, smile=0.28)
    hair = mat('hair', (0.04, 0.025, 0.02), 0.0, 0.45, coat=0.3)
    h = sphere((0, 0.1, 0.18), (1.06, 1.02, 0.98), hair, seg=48)
    cut(h, (0, -1.65, 0.0), (2.0, 1.0, 1.0))  # bare face below the hairline
    q = sphere((0, -0.45, 1.0), (0.55, 0.45, 0.28), hair, seg=24); q.rotation_euler = (-0.3, 0, 0)
    beard(hair, width=0.86, depth=0.72, z=-0.74, height=0.44, mustache=0.3)
    shoulders(TEAL(), wide=1.5)
    bib = box((0, -0.72, -1.82), (0.6, 0.07, 0.6), mat('apron', (0.45, 0.2, 0.08), 0.0, 0.6, coat=0.3))
    for sx in (-1, 1):
        s = box((sx * 0.42, -0.62, -1.15), (0.06, 0.04, 0.55), mat('strap', (0.35, 0.15, 0.06), 0.0, 0.6)); s.rotation_euler = (0, sx * -0.35, 0)
    sphere((0, -0.9, -1.55), (0.14, 0.05, 0.14), GOLD(), seg=16)


TEAL = lambda: mat('teal_shirt', (0.10, 0.52, 0.48), 0.0, 0.7)


def tariq():  # sheikh: white ghutra + agal, grey beard, black bisht with gold trim over white thobe
    head((0.78, 0.58, 0.43))
    face(brow=0.35, brow_color=(0.35, 0.33, 0.32), smile=0.2, blush=False)
    shoulders(WHITE_CLOTH(), wide=1.45)
    bisht = sphere((0, 0.15, -1.85), (1.75, 0.9, 0.8), BLACK_CLOTH(), seg=40)
    cut(bisht, (0, -1.3, -1.0), (0.32, 1.0, 1.3))
    for sx in (-1, 1):
        box((sx * 0.34, -0.8, -1.65), (0.04, 0.03, 0.7), GOLD()).rotation_euler = (0, sx * 0.1, 0)
    gulf_headwear(WHITE_CLOTH())
    beard(mat('grey_beard', (0.62, 0.60, 0.58), 0.0, 0.85), width=0.9, depth=0.76, z=-0.76, height=0.46)


def lama():  # creator: coral silk hijab with gold trim, lashes, red lips, plum abaya
    head((0.88, 0.68, 0.55), ear=False)
    face(brow=0.1, lips=mat('lips', (0.75, 0.08, 0.14), 0.0, 0.25, coat=1.0), lashes=True, smile=0.3)
    shoulders(mat('plum', (0.22, 0.07, 0.24), 0.0, 0.7), trim=GOLD(), wide=1.55)
    silk = mat('coral_silk', (0.92, 0.36, 0.22), 0.0, 0.45, coat=0.1)
    gulf_headwear(silk, agal=False, face_cut_y=-0.2, face_cut_z=0.5)
    torus((0, 0.08, 0.58), 1.03, 0.035, GOLD())
    for sx in (-1, 1):
        sphere((sx * 0.9, -0.5, -0.5), (0.05, 0.05, 0.05), GOLD(), seg=10)
    sphere((0.78, -0.55, -1.2), (0.12, 0.05, 0.12), GOLD(), seg=14)  # brooch


def sultan():  # Sultan Al-Diriyah: red-white shemagh + agal, dark beard, brown bisht with heavy gold
    head((0.74, 0.54, 0.40))
    face(brow=0.4, brow_color=(0.05, 0.03, 0.02), smile=0.16, blush=False)
    shoulders(WHITE_CLOTH(), wide=1.45)
    bisht = sphere((0, 0.15, -1.85), (1.8, 0.92, 0.82), mat('brown_bisht', (0.30, 0.17, 0.08), 0.0, 0.8), seg=40)
    cut(bisht, (0, -1.3, -1.0), (0.3, 1.0, 1.3))
    for sx in (-1, 1):
        box((sx * 0.32, -0.8, -1.65), (0.06, 0.03, 0.72), GOLD()).rotation_euler = (0, sx * 0.1, 0)
    sphere((0, -0.9, -1.55), (0.2, 0.07, 0.2), GOLD(), seg=20)  # medallion
    gulf_headwear(checker((0.72, 0.05, 0.05), (0.97, 0.96, 0.94)))
    beard(mat('dark_beard', (0.04, 0.03, 0.025), 0.0, 0.8), width=0.93, depth=0.8, z=-0.78, height=0.5, mustache=0.34)
    for sx in (-1, 1):
        sphere((sx * 0.5, -0.86, -0.78), (0.1, 0.05, 0.16), mat('grey_streak', (0.6, 0.6, 0.6), 0.0, 0.8), seg=12)


def ghabga():  # Coffee Festival Jury: gold star medal on a green-and-red ribbon, with a tiny dallah
    import bmesh
    pts = []
    for i in range(10):
        r = 1.0 if i % 2 == 0 else 0.46
        a = math.pi / 2 + i * math.pi / 5
        pts.append((r * math.cos(a), 0, r * math.sin(a)))
    me = bpy.data.meshes.new('star'); bm = bmesh.new()
    vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs); bm.to_mesh(me); bm.free()
    star = bpy.data.objects.new('star', me); bpy.context.collection.objects.link(star)
    bpy.context.view_layer.objects.active = star
    sol = star.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.26; sol.offset = 0
    bev = star.modifiers.new('bev', 'BEVEL'); bev.width = 0.06; bev.segments = 3
    assign(star, GOLD()); star.location = (0, 0, 0.1)
    cyl((0, 0.0, 0.1), 0.38, 0.34, mat('gold2', (1.0, 0.8, 0.25), 1.0, 0.15), rot=(math.pi / 2, 0, 0))
    for sx in (-1, 1):
        r = box((sx * 0.3, 0.2, -0.95), (0.27, 0.04, 0.8), mat('ribbon', (0.05, 0.45, 0.22), 0.0, 0.6)); r.rotation_euler = (0, sx * -0.3, 0)
        box((sx * 0.3, 0.17, -0.95), (0.05, 0.045, 0.78), mat('ribbon_stripe', (0.95, 0.95, 0.9), 0.0, 0.6)).rotation_euler = (0, sx * -0.3, 0)


CHARACTERS = [noura, faisal, tariq, lama, sultan, ghabga]

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    only = os.environ.get('ONLY')
    for fn in CHARACTERS:
        if only and fn.__name__ not in only.split(','):
            continue
        reset()
        ramp = [n for n in bpy.context.scene.world.node_tree.nodes if n.type == 'VALTORGB'][0]
        ramp.color_ramp.elements[0].color = (0.34, 0.21, 0.11, 1)
        fn()
        if fn.__name__ == 'ghabga':
            portrait_stage(center=(0, 0, -0.45), dist=9.5, elev=2, azim=-8)
        else:
            portrait_stage()
        A.render(fn.__name__)
