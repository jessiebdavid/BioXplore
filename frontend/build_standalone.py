"""
Multidimensional Knowledge System - Standalone HTML Bundler
Inlines HTML, CSS, and JS files into a single, zero-dependency standalone.html file.
"""

import os

def build_standalone():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "css", "styles.css")
    out_path = os.path.join(base_dir, "standalone.html")

    script_files = [
        "mock-data.js",
        "mock-engine.js",
        "api.js",
        "auth.js",
        "navigation.js",
        "animations.js",
        "graph.js",
        "render.js",
        "app.js"
    ]

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Inline CSS
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
    html = html.replace('<link rel="stylesheet" href="css/styles.css" />', f"<style>\n{css}\n</style>")

    # Remove external script tags and accumulate inlined script
    combined_js = []
    for s_name in script_files:
        s_path = os.path.join(base_dir, "js", s_name)
        if os.path.exists(s_path):
            with open(s_path, "r", encoding="utf-8") as sf:
                s_content = sf.read()
                combined_js.append(f"/* --- {s_name} --- */\n{s_content}")
        tag = f'<script src="js/{s_name}"></script>'
        html = html.replace(tag, "")

    # Clean up empty lines where scripts were
    inlined_script = "<script>\n" + "\n\n".join(combined_js) + "\n</script>"
    html = html.replace("</body>", f"{inlined_script}\n</body>")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Generated standalone build successfully at: {out_path} ({len(html)} bytes)")

if __name__ == "__main__":
    build_standalone()
