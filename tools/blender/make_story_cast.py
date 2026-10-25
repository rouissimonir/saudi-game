"""Waist-up story-scene characters with facial expressions, rendered with Blender (bpy).

Builds on the bust heads in make_characters.py: the same faces, headwear and materials, plus a torso, arms and
hands, and two characters the busts do not have (Layla, the heroine, and Rashid, the rival developer).
Output: <out>/<character>_<expression>.png at 768x1024 with a transparent background; convert to WebP with
tools/art/to_webp.py.

    SAMPLES=48 ONLY=layla,noura python tools/blender/make_story_cast.py -- public/assets/art/story
"""
import math, os, sys
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_art as A  # noqa: E402
import make_characters as C  # noqa: E402
from make_art import mat, sphere, box, torus, curve_tube  # noqa: E402
from make_characters import head, face, gulf_headwear, beard, skin, GOLD, BLACK_CLOTH, WHITE_CLOTH  # noqa: E402

W, H = 768, 1024


def body(cloth, skin_color, trim=None, sleeve=None):
    """Torso to the waist under the bust shoulders, arms down the sides and hands resting together in front."""
    C.shoulders(cloth, trim=trim)
    sphere((0, 0.12, -2.95), (1.42, 0.82, 1.5), cloth, seg=48)
    arm = sleeve or cloth
    for sx in (-1, 1):
        curve_tube([(sx * 1.38, 0.08, -1.9), (sx * 1.58, -0.02, -2.75), (sx * 1.05, -0.62, -3.5), (sx * 0.5, -0.86, -3.62)], 0.3, arm)
        sphere((sx * 0.36, -0.9, -3.62), (0.25, 0.2, 0.22), skin(skin_color), seg=24)
        if trim:
            box((sx * 0.3, -0.8, -2.75), (0.05, 0.03, 1.45), trim).rotation_euler = (0, sx * 0.04, 0)


def layla():  # heroine: emerald silk hijab with a gold band, cream abaya with gold trim, leather bag strap
    sk = (0.86, 0.66, 0.52)
    head(sk, ear=False)
    face(brow=0.08, lips=mat('lips', (0.72, 0.30, 0.30), 0.0, 0.35, coat=0.6), lashes=True, smile=0.26)
    body(mat('cream_abaya', (0.93, 0.88, 0.78), 0.0, 0.8), sk, trim=GOLD())
    silk = mat('emerald_silk', (0.05, 0.42, 0.30), 0.0, 0.45, coat=0.1)
    gulf_headwear(silk, agal=False, face_cut_y=-0.2, face_cut_z=0.5)
    torus((0, 0.08, 0.58), 1.03, 0.03, GOLD())
    sphere((0, -0.86, -1.52), (0.13, 0.05, 0.13), GOLD(), seg=16)  # pendant


def noura():  # grandmother from the busts, now with a black abaya body
    sk = (0.86, 0.66, 0.52)
    C.noura()
    body(BLACK_CLOTH(), sk, trim=GOLD())


def rashid():  # rival developer: white ghutra + agal, neat goatee, charcoal bisht over a white thobe, gold watch
    sk = (0.80, 0.60, 0.45)
    head(sk)
    face(brow=0.3, brow_color=(0.04, 0.03, 0.02), smile=0.12, blush=False)
    body(WHITE_CLOTH(), sk)
    bisht = sphere((0, 0.16, -2.6), (1.62, 0.92, 2.1), mat('charcoal_bisht', (0.12, 0.12, 0.14), 0.0, 0.75), seg=48)
    C.cut(bisht, (0, -1.4, -2.2), (0.38, 1.0, 2.6))
    for sx in (-1, 1):
        box((sx * 0.4, -0.84, -2.25), (0.035, 0.03, 1.0), mat('silver', (0.75, 0.76, 0.8), 1.0, 0.3)).rotation_euler = (0, sx * 0.05, 0)
    gulf_headwear(WHITE_CLOTH())
    goatee = mat('goatee', (0.03, 0.02, 0.02), 0.0, 0.8)
    sphere((0, -0.74, -0.86), (0.3, 0.2, 0.26), goatee, seg=24)
    sphere((0, -0.9, -0.27), (0.3, 0.07, 0.06), goatee, seg=16)
    torus((0.62, -0.92, -3.62), 0.14, 0.05, GOLD(), rot=(0, math.pi / 2, 0))


# Softer resting brows for characters whose neutral face should read friendly rather than stern.
BROW_BIAS = {'layla': 0.16, 'noura': 0.08}

CAST = {
    'layla': (layla, ['neutral', 'happy', 'surprised', 'worried']),
    'noura': (noura, ['neutral', 'happy', 'surprised', 'worried']),
    'rashid': (rashid, ['neutral', 'angry', 'surprised']),
}


def stage():
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = W, H
    ramp = [n for n in s.world.node_tree.nodes if n.type == 'VALTORGB'][0]
    ramp.color_ramp.elements[0].color = (0.34, 0.21, 0.11, 1)
    C.portrait_stage(center=(0, 0, -1.45), dist=17.0, lens=85, elev=4, azim=-9)


if __name__ == '__main__':
    os.makedirs(A.OUT, exist_ok=True)
    only = os.environ.get('ONLY')
    exprs_only = os.environ.get('EXPR')
    for name, (build, exprs) in CAST.items():
        if only and name not in only.split(','):
            continue
        for expr in exprs:
            if exprs_only and expr not in exprs_only.split(','):
                continue
            A.reset()
            C.EXPR['expr'] = expr
            C.EXPR['tilt_bias'] = BROW_BIAS.get(name, 0.0)
            build()
            stage()
            A.render(f'{name}_{expr}')
