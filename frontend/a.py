import os
import chardet  # You may need to install this library: pip install chardet

# Define the base directory and file to exclude
base_dir = os.path.dirname(os.path.abspath(__file__))
exclude_files = {
    "webpack.config.js",
    "tsconfig.json",
    "tsconfig.build.json",
    "README.md",
    "package.json",
    "docker-compose.yml",
    ".dockerignore",
    "Dockerfile",
    ".gitignore",
    ".eslintrc.js",
    ".prettierrc.js",
    ".prettierrc",
    "LICENSE",
    "a.py",
    "yarn.lock",
    ".editorconfig",
    "package-lock.json",
    "vite.config.js",
    "yarn.lock",
    "tsconfig.json",
    "tsconfig.node.json",
    ".prettierignore",
    "project_structure_code.txt",
    "src/assets/react.svg",  # Added specific asset
    ".prettierignore",       # Added config file
    "project_structure_code.txt", # Already present, but good to keep
    "src/vite-env.d.ts",        # Added TypeScript declaration file
    "commitlint.config.cjs",  # Added commitlint config
    ".eslintrc.cjs",          # Added ESLint config
    "index.html"            # Added index.html (will be handled separately later)

}

# Note: Adding entire directories to exclude_files is less efficient than using exclude_dirs.
#       We handle specific files *within* those directories separately below.
exclude_dirs = {
    "test",
    "node_modules",
    "dist",
    ".git",
    "dist",
    "public",  # Exclude everything in public/
    "stories",  # Storybook files
    "utils", # Exclude the utils folder
    "types",  # Exclude the types folder
    "assets",  # Exclude the assets folder
    "src/components/Nprogress" #Exclude Nprogress folder in component.
}

# Output file
output_file = os.path.join(base_dir, "project_structure_code.txt")

def should_exclude(path):
    """Check if the given path should be excluded."""
    for exclude in exclude_dirs:
        if f"{os.sep}{exclude}{os.sep}" in path or path.startswith(exclude + os.sep) or path.endswith(exclude):
            return True

    # Check for Storybook files *anywhere* in the path:
    if ".stories." in path:
        return True

    return False

def detect_encoding(file_path):
    """Detect the file encoding."""
    with open(file_path, 'rb') as f:
        raw_data = f.read()
        result = chardet.detect(raw_data)
        return result['encoding']

def extract_code_structure(base_dir, output_file):
    """Extract the code structure and write to the output file."""
    with open(output_file, "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(base_dir):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                #Combine  exclude_files and exclude file by endswith
                if file in exclude_files or file.endswith((".json", ".md",".svg")):
                    continue

                file_path = os.path.join(root, file)

                if should_exclude(file_path):
                    continue

                relative_path = os.path.relpath(file_path, base_dir)

                # Special handling for index.html (trimming)
                if file == "index.html":
                    try:
                        with open(file_path, "r", encoding="utf-8") as code_file:
                            content = code_file.readlines() # Read as lines

                            # Find the start and end of the relevant section
                            start_line = -1
                            end_line = -1
                            for i, line in enumerate(content):
                                if '<div id="root">' in line:
                                    start_line = i -1 #include head
                                if '</body>' in line:
                                    end_line = i + 1
                                    break

                            if start_line != -1 and end_line != -1:
                                f.write(f"{relative_path}:\n")
                                f.write("".join(content[start_line:end_line])) # Write the trimmed content
                                f.write("\n\n")
                            # else:  # Optionally handle cases where the div isn't found.
                            #     print(f"Warning: Could not find <div id=\"root\"> in {relative_path}")
                    except UnicodeDecodeError:
                        print(f"Skipping {file_path} due to UnicodeDecodeError.")
                    continue  # Skip to the next file

                #Special Handling for App.tsx
                if file == "App.tsx":
                    try:
                        with open(file_path, "r", encoding="utf-8") as code_file:
                            content = code_file.read()
                            content = content.replace(r"export const COLOR =[^;]+;", "") #Remove that constant, using regex.
                            f.write(f"{relative_path}:\n")
                            f.write(content)
                            f.write("\n\n")

                    except UnicodeDecodeError:
                        print(f"Skipping {file_path} due to UnicodeDecodeError.")
                    continue #skip next file
                
                # For all other files, proceed as before:
                f.write(f"{relative_path}:\n")
                
                try:
                    # Attempt to read the file with UTF-8 encoding
                    with open(file_path, "r", encoding="utf-8") as code_file:
                        content = code_file.read()
                except UnicodeDecodeError:
                    # Detect the file's encoding and read with it
                    encoding = detect_encoding(file_path)
                    with open(file_path, "r", encoding=encoding) as code_file:
                        content = code_file.read()
                
                f.write(content + "\n\n")
    print(f"Code structure extracted to {output_file}")

# Execute the function
extract_code_structure(base_dir, output_file)