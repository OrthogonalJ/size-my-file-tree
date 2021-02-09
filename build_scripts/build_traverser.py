import os
import PyInstaller.__main__

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), '..')

PyInstaller.__main__.run([
    os.path.join(PROJECT_ROOT, 'traverser/__main__.py'),
    #'--onefile',
    '--clean',
    '--distpath', os.path.join(PROJECT_ROOT, 'ui/src/dist/traverser'),
    '--workpath', os.path.join(PROJECT_ROOT, 'build/traverser'),
    '--specpath', os.path.join(PROJECT_ROOT, 'build/traverser')
])