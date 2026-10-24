"""Procedural Khaleeji hero props rendered to transparent PNGs with Blender (bpy)."""
import math, sys, os, random
import bpy, bmesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1]
SIZE = 512
SAMPLES = int(os.environ.get('SAMPLES', '48'))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.device = 'CPU'
    s.cycles.samples = SAMPLES
    s.cycles.use_denoising = True
    s.render.resolution_x = s.render.resolution_y = SIZE
    s.render.film_transparent = True
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.view_settings.view_transform = 'Standard'
    s.view_settings.look = 'None'
    w = bpy.data.worlds.new('w'); s.world = w; w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes['Background']; bg.inputs[1].default_value = 0.8
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], bg.inputs[0])
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (0.10, 0.05, 0.03, 1)
    ramp.color_ramp.elements[1].position = 0.62; ramp.color_ramp.elements[1].color = (1.0, 0.90, 0.72, 1)


def mat(name, color, metallic=0.0, rough=0.5, coat=0.0, emission=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.08
    if emission:
        b.inputs['Emission Color'].default_value = (*emission, 1)
        b.inputs['Emission Strength'].default_value = 1.5
    return m


BRASS = lambda: mat('brass', (0.80, 0.50, 0.10), 1.0, 0.26)
COPPER = lambda: mat('copper', (0.80, 0.38, 0.20), 1.0, 0.28)
WHITE = lambda: mat('ceramic', (0.96, 0.94, 0.90), 0.0, 0.12, coat=1.0)
COFFEE = lambda: mat('coffee', (0.09, 0.04, 0.02), 0.0, 0.05, coat=1.0)
WOOD = lambda: mat('wood', (0.16, 0.07, 0.025), 0.0, 0.5, coat=0.3)
DATE = lambda: mat('date', (0.10, 0.035, 0.012), 0.0, 0.3, coat=0.25)
RED = lambda: mat('sadu_red', (0.62, 0.12, 0.10), 0.0, 0.7)
BEAN = lambda: mat('bean', (0.09, 0.04, 0.015), 0.0, 0.4, coat=0.15)


def assign(obj, m):
    obj.data.materials.clear(); obj.data.materials.append(m)
    return obj


def lathe(profile, m, steps=64, name='lathe'):
    """profile: [(radius, z), ...] revolved around Z."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(r, 0, z) for r, z in profile], [(i, i + 1) for i in range(len(profile) - 1)], [])
    obj = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    sc = obj.modifiers.new('screw', 'SCREW'); sc.axis = 'Z'; sc.steps = steps; sc.render_steps = steps; sc.angle = 2 * math.pi
    sc.use_merge_vertices = True; sc.merge_threshold = 1e-4
    bpy.ops.object.modifier_apply(modifier='screw')
    bpy.ops.object.shade_smooth()
    obj.modifiers.new('sub', 'SUBSURF').levels = 1
    return assign(obj, m)


def sphere(loc, scale, m, seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc)
    o = bpy.context.object; o.scale = scale; bpy.ops.object.shade_smooth(); return assign(o, m)


def cyl(loc, r, depth, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); return assign(o, m)


def box(loc, size, m):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.scale = size
    bev = o.modifiers.new('bev', 'BEVEL'); bev.width = 0.02; bev.segments = 3
    return assign(o, m)


def torus(loc, major, minor, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=loc, rotation=rot, major_segments=48, minor_segments=16)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); return assign(o, m)


def curve_tube(points, radius, m, radii=None):
    cu = bpy.data.curves.new('c', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 6
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(points) - 1)
    for p, bp in zip(points, sp.bezier_points):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    if radii:
        for r, bp in zip(radii, sp.bezier_points): bp.radius = r
    o = bpy.data.objects.new('tube', cu); bpy.context.collection.objects.link(o)
    cu.materials.append(m); return o


def stage(center_z=0.5, dist=5.2, elev=22, azim=-28):
    s = bpy.context.scene
    cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 70
    cam = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(cam)
    t = Vector((0, 0, center_z)); e, a = math.radians(elev), math.radians(azim)
    cam.location = t + Vector((dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), dist * math.sin(e)))
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    s.camera = cam
    for loc, energy, size, col in [((-3, -4, 5), 380, 4, (1, 0.95, 0.88)), ((4, -2, 3), 160, 4, (1, 0.85, 0.65)), ((0, 4, 4), 140, 5, (0.8, 0.9, 1))]:
        ld = bpy.data.lights.new('l', 'AREA'); ld.energy = energy; ld.size = size; ld.color = col
        lo = bpy.data.objects.new('l', ld); lo.location = loc; bpy.context.collection.objects.link(lo)
        lo.rotation_euler = (Vector((0, 0, center_z)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


def render(name):
    bpy.context.scene.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', name)


# ---------------------------------------------------------------- assets
def dallah():
    reset(); b = BRASS()
    body = [(0.0, 0.0), (0.74, 0.0), (0.9, 0.1), (0.88, 0.3), (0.62, 0.7), (0.42, 1.1), (0.36, 1.5), (0.5, 1.82), (0.56, 1.95), (0.0, 1.95)]
    lathe(body, b, name='body')
    lathe([(0.0, 0.0), (0.8, 0.0), (0.8, 0.07), (0.0, 0.07)], COPPER(), name='base')
    lathe([(0.0, 1.95), (0.56, 1.95), (0.5, 2.1), (0.3, 2.28), (0.0, 2.36)], b, name='lid')
    sphere((0, 0, 2.42), (0.1, 0.1, 0.12), COPPER())
    torus((0, 0, 1.62), 0.4, 0.04, COPPER()); torus((0, 0, 1.05), 0.46, 0.035, COPPER()); torus((0, 0, 0.34), 0.88, 0.035, COPPER())
    # long swan-neck beak spout, wide at the base, thin at the tip
    curve_tube([(0.62, 0, 0.35), (1.0, 0, 0.8), (1.3, 0, 1.5), (1.15, 0, 2.15), (0.85, 0, 2.55)], 0.1, b, radii=[2.2, 1.5, 1.0, 0.75, 0.55])
    sphere((0.85, 0, 2.58), (0.1, 0.1, 0.1), COPPER())
    curve_tube([(-0.5, 0, 1.75), (-1.15, 0, 1.9), (-1.2, 0, 0.9), (-0.75, 0, 0.35)], 0.075, WOOD())
    stage(center_z=1.25, dist=8.5); render('dallah')


def finjan():
    reset()
    lathe([(0.0, 0.0), (0.22, 0.0), (0.3, 0.05), (0.42, 0.4), (0.5, 0.62), (0.46, 0.63), (0.38, 0.4), (0.3, 0.12), (0.0, 0.1)], WHITE(), name='cup')
    cof = cyl((0, 0, 0.5), 0.41, 0.02, COFFEE())
    lathe([(0.0, 0.0), (0.7, 0.02), (0.95, 0.1), (0.9, 0.12), (0.0, 0.1)], WHITE(), name='saucer').location.z = -0.12
    torus((0, 0, 0.5), 0.5, 0.025, BRASS())
    sphere((0.9, 0.6, -0.04), (0.16, 0.12, 0.1), mat('cardamom', (0.3, 0.55, 0.2), 0, 0.4))
    stage(center_z=0.3, dist=5.0, elev=28); render('finjan')


def v60():
    reset()
    lathe([(0.0, 0.0), (0.12, 0.0), (0.2, 0.05), (0.75, 0.9), (0.8, 1.0), (0.74, 1.0), (0.18, 0.12), (0.0, 0.12)], WHITE(), name='cone')
    torus((0, 0, 1.0), 0.78, 0.04, WHITE())
    lathe([(0.0, -1.3), (0.52, -1.3), (0.62, -1.1), (0.48, -0.5), (0.3, -0.2), (0.3, -0.05), (0.0, -0.05)], mat('glass', (0.7, 0.85, 0.9), 0.0, 0.03, coat=1.0), name='server')
    lathe([(0.0, -1.28), (0.5, -1.28), (0.58, -1.1), (0.5, -0.9), (0.0, -0.9)], COFFEE(), name='brew')
    curve_tube([(0.75, 0, 0.95), (1.1, 0, 1.1), (1.2, 0, 0.8), (0.95, 0, 0.5)], 0.05, WHITE())
    stage(center_z=-0.1, dist=7.5); render('v60')


def mabkhara():
    reset(); b = BRASS()
    lathe([(0.0, 0.0), (0.5, 0.0), (0.55, 0.06), (0.32, 0.18), (0.22, 0.6), (0.4, 0.95), (0.62, 1.1), (0.6, 1.2), (0.0, 1.0)], b, name='stem')
    lathe([(0.0, 1.05), (0.55, 1.1), (0.7, 1.3), (0.66, 1.34), (0.0, 1.2)], COPPER(), name='bowl')
    for i in range(14):
        a = i * 2 * math.pi / 14
        torus((0.4 * math.cos(a), 0.4 * math.sin(a), 1.23), 0.05, 0.015, b, rot=(1.2, 0, a))
    ember = mat('ember', (1.0, 0.25, 0.04), 0, 0.5, emission=(1.0, 0.3, 0.05))
    for _ in range(6):
        sphere((random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), 1.28), (0.1, 0.09, 0.07), ember)
    stage(center_z=0.65, dist=5.2, elev=30); render('mabkhara')


def dates():
    reset(); random.seed(7)
    lathe([(0.0, 0.0), (0.7, 0.0), (1.05, 0.25), (1.1, 0.5), (1.02, 0.5), (0.85, 0.3), (0.5, 0.14), (0.0, 0.12)], WOOD(), name='bowl')
    d = DATE()
    for ring, (rad, z, n) in enumerate([(0.62, 0.38, 7), (0.35, 0.58, 5), (0.0, 0.76, 1), (0.82, 0.46, 9)]):
        for i in range(n):
            a = i * 2 * math.pi / max(n, 1) + ring
            o = sphere((rad * math.cos(a), rad * math.sin(a), z), (0.2, 0.13, 0.12), d)
            o.rotation_euler = (random.uniform(-.4, .4), random.uniform(-.4, .4), random.uniform(0, 3.14))
    stage(center_z=0.45, dist=5.4, elev=34); render('dates')


def chest():
    reset(); w = WOOD(); b = BRASS()
    box((0, 0, 0.45), (1.0, 0.65, 0.45), w)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.65, depth=2.0, location=(0, 0, 0.9), rotation=(0, math.pi / 2, 0))
    lid = bpy.context.object; lid.scale = (1, 1, 1); bpy.ops.object.shade_smooth(); assign(lid, w)
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0.5)); cut = bpy.context.object; cut.scale = (1.2, 0.8, 0.5)
    md = lid.modifiers.new('bool', 'BOOLEAN'); md.object = cut; md.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = lid; bpy.ops.object.modifier_apply(modifier='bool'); bpy.data.objects.remove(cut)
    for x in (-0.75, 0.0, 0.75):
        box((x, 0, 0.45), (0.07, 0.68, 0.47), b)
        cyl((x, 0, 0.9), 0.68, 0.12, b, rot=(0, math.pi / 2, 0))
    box((0, -0.66, 0.78), (0.14, 0.04, 0.16), b)
    box((0, -0.62, 0.15), (0.97, 0.02, 0.08), RED())
    stage(center_z=0.6, dist=6.5, azim=-30); render('chest')


def beans():
    reset(); random.seed(3); m = BEAN()
    for i in range(46):
        r = 0.75 * math.sqrt(random.random()); a = random.uniform(0, 6.28)
        z = 0.14 + 0.35 * (1 - r / 0.75) ** 1.5
        o = sphere((r * math.cos(a), r * math.sin(a), z), (0.17, 0.11, 0.09), m, seg=20)
        o.rotation_euler = (random.uniform(-.5, .5), random.uniform(-.5, .5), random.uniform(0, 6.28))
        sp = bpy.data.objects.new('seam', bpy.data.meshes.new('seam'))
    stage(center_z=0.25, dist=5.5, elev=38); render('beans')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    only = os.environ.get('ONLY')
    for fn in (dallah, finjan, v60, mabkhara, dates, chest, beans):
        if not only or fn.__name__ in only.split(','):
            fn()
