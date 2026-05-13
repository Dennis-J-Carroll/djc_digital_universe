import os
import subprocess
import shutil

cwd = "/home/dennisjcarroll/everything-personal-website/everything-personal-website/Add to site/New apps|projects+/algebraic-flow"
subprocess.run(["pnpm", "install"], cwd=cwd)
subprocess.run(["pnpm", "run", "build"], cwd=cwd)

# Now copy to static/apps
src_dir = os.path.join(cwd, "dist")
dest_dir = "/home/dennisjcarroll/everything-personal-website/everything-personal-website/static/apps/algebraic-flow"

if os.path.exists(dest_dir):
    shutil.rmtree(dest_dir)
shutil.copytree(src_dir, dest_dir)
print("Done")
