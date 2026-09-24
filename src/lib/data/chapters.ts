export type Q = { q: string; o: string[]; a: number; e: string };
export type Check = {
	id: string;
	label: string;
	kind: 'text' | 'num' | 'posint' | 'path' | 'contains' | 'shape' | 'pathlike' | 'yesno';
	accept?: string[];
	value?: number;
	tol?: number;
	hint: string;
};
export type Mission = { id: string; text: string; hint?: string; reveal?: string };
export type Chapter = {
	n: number;
	title: string;
	short: string;
	lith: 'shale' | 'sand' | 'lime' | 'cong' | 'ign';
	blurb: string;
	play?: { title: string; intro: string; missions: Mission[] };
	quiz: Q[];
	lab: { goal: string; steps: string[]; checks: Check[] };
};

const R = String.raw;

export const CHAPTERS: Chapter[] = [
	{
		n: 1,
		title: 'What a computer actually is',
		short: 'The computer',
		lith: 'sand',
		blurb: 'CPU, RAM, storage, and why everything is numbers.',
		play: {
			title: 'Switches, lamps and bytes',
			intro: 'Eight switches make one byte. Flip them and watch the same pattern read as a number and as a letter.',
			missions: [
				{ id: 'a65', text: 'Set the switches to 65 and see which letter appears', hint: '65 = 64 + 1. Turn on the lamp worth 64 and the lamp worth 1.' },
				{ id: 'all', text: 'Turn on all eight lamps: the biggest number one byte can hold', hint: 'Every switch up. The number is 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1.' },
				{ id: 'name', text: 'Type NEHA into the byte viewer and count the bytes', hint: 'The text box under “Words are bytes too”. Capitals or lower case both count.' },
				{ id: 'power', text: 'Save your work to storage, then survive a power cut', hint: 'Save, Power cut, Power on, then Open file. The order matters: saving after the cut is too late.' }
			]
		},
		quiz: [
			{ q: 'Which part loses its contents when the power goes off?', o: ['Storage (SSD)', 'RAM', "The CPU's instruction set", 'Files you have saved'], a: 1, e: 'RAM is the bench: fast but temporary. Saved files live in storage, the archive.' },
			{ q: 'In the lab analogy, who is the analyst doing the work?', o: ['The CPU', 'RAM', 'The hard disk', 'The keyboard'], a: 0, e: 'The CPU carries out instructions, one tiny step at a time, billions of times per second.' },
			{ q: 'How many bits make one byte?', o: ['2', '8', '10', '1,000'], a: 1, e: 'Eight bits, each a 0 or 1, make one byte.' },
			{ q: 'Why does a .jpg opened in a text editor look like nonsense?', o: ['The file is corrupted', 'Bytes mean nothing until a program interprets them; the editor reads them as text', 'Text editors cannot open files', 'Images are not stored as numbers'], a: 1, e: 'Everything is stored as numbers. Meaning comes from which program interprets them, and how.' },
			{ q: 'A laptop has “16 GB and 512 GB”. Which is which?', o: ['16 GB storage, 512 GB RAM', '16 GB RAM, 512 GB storage', 'Both are RAM', 'Both are storage'], a: 1, e: 'Storage is almost always much larger than RAM, just as an archive is larger than a bench.' }
		],
		lab: {
			goal: 'Find the bench size and archive size of your own laptop.',
			steps: [
				R`Open <strong>Settings → System → About</strong> (Mac: Apple menu → About This Mac).`,
				R`Find the <em>Installed RAM</em> and the processor name.`,
				R`Open <strong>Settings → System → Storage</strong> and find your total storage size.`
			],
			checks: [
				{ id: 'ram', label: 'How much RAM does your laptop have, in GB?', kind: 'posint', hint: 'Look for “Installed RAM”. Type just the number, such as 16.' },
				{ id: 'disk', label: 'How much storage does it have, in GB? (1 TB = 1000 GB)', kind: 'posint', hint: 'Under Storage, look for the total size of your main drive.' },
				{ id: 'bigger', label: 'Is your storage larger than your RAM? (yes/no)', kind: 'text', accept: ['yes'], hint: 'Compare the two numbers you just found.' }
			]
		}
	},
	{
		n: 2,
		title: 'The operating system',
		short: 'Operating system',
		lith: 'lime',
		blurb: 'The lab manager that every program asks for help.',
		play: {
			title: 'The lab manager at work',
			intro: 'One analyst, three projects. Watch the operating system share the CPU, then route requests to the right job.',
			missions: [
				{ id: 'run', text: 'Run the scheduler until all three processes finish', hint: 'Press Run and wait, or press One tick until every bar says done.' },
				{ id: 'slice', text: 'Change the time slice and run it again', hint: 'Move the Time slice slider to a different value, then Run again to the end.' },
				{ id: 'sort', text: 'Route all eight requests to the right job', hint: 'Sharing the CPU is Scheduling; RAM is Memory; devices go through Drivers; anything about who is allowed is Permissions.' }
			]
		},
		quiz: [
			{ q: 'What is the difference between a program and a process?', o: ['They are the same thing', 'A program is instructions in storage; a process is that program running', 'A process is a program that has crashed', 'A program runs only on Linux'], a: 1, e: 'Like a written protocol (program) versus that protocol being carried out today (process).' },
			{ q: 'When a program opens a file, what actually finds it on disk?', o: ['The program reads the disk directly', 'The operating system, through a system call', 'The mouse', 'The CPU without any software'], a: 1, e: 'Programs ask the OS to do things like opening files. These requests are system calls.' },
			{ q: 'Why does a Windows program usually not run on macOS?', o: ['Macs have weaker processors', 'The two operating systems accept different requests', 'macOS forbids downloads', 'File names are different'], a: 1, e: "Programs are built around one OS's system calls. The lab managers take different request forms." },
			{ q: 'What is a driver?', o: ['A program that controls a device such as Wi-Fi or a printer', 'A type of CPU', 'A Python package', 'The person using the computer'], a: 0, e: 'The OS reaches hardware through small device-specific programs called drivers.' },
			{ q: 'A university research cluster most likely runs…', o: ['Windows', 'macOS', 'Linux', 'Android'], a: 2, e: 'Servers and clusters overwhelmingly run Linux, which is why tutorials assume it.' }
		],
		lab: {
			goal: 'Watch processes appear and disappear on your own laptop.',
			steps: [
				R`Open <strong>Task Manager</strong> with <code>Ctrl + Shift + Esc</code> (Mac: Activity Monitor) and stay on the <em>Processes</em> tab.`,
				R`Open <strong>Notepad</strong> and find its new entry in the list.`,
				R`Close Notepad and watch the entry go.`,
				R`Switch to the <em>Performance</em> tab and click <em>CPU</em>.`
			],
			checks: [
				{ id: 'np', label: 'What process name appeared when you opened Notepad?', kind: 'text', accept: ['notepad', 'notepad.exe'], hint: 'It is listed under Apps.' },
				{ id: 'gone', label: 'Did it disappear when you closed Notepad? (yes/no)', kind: 'text', accept: ['yes'], hint: 'A closed program is no longer a running process.' },
				{ id: 'lp', label: 'How many logical processors does the CPU page show?', kind: 'posint', hint: 'Near the bottom right of the CPU page. Any whole number is fine.' }
			]
		}
	},
	{
		n: 3,
		title: 'Files, folders and paths',
		short: 'Files and paths',
		lith: 'cong',
		blurb: 'The tree, absolute and relative paths, and extensions.',
		play: {
			title: 'Walk the tree',
			intro: 'Click a folder to stand in it. Type a path and see where it leads, or where it breaks.',
			missions: [
				{ id: 'rel', text: 'Standing in thesis, reach boreholes.csv with a relative path', hint: 'From thesis, the file is inside data. No drive letter needed.', reveal: 'data\\boreholes.csv' },
				{ id: 'up', text: 'Standing in mca, reach the same file using ..', hint: 'Click the mca folder first. .. takes you up to Neha, then down into thesis.', reveal: '..\\thesis\\data\\boreholes.csv' },
				{ id: 'abs', text: 'Reach it with an absolute path from anywhere', hint: 'Start from the drive letter and spell out every folder.', reveal: 'C:\\Users\\Neha\\thesis\\data\\boreholes.csv' },
				{ id: 'fail', text: 'Make a relative path fail on purpose', hint: 'Stand in mca and type data\\boreholes.csv: there is no data folder there.', reveal: 'data\\boreholes.csv (from mca)' }
			]
		},
		quiz: [
			{ q: 'An absolute path…', o: ['Starts from the folder you are in', 'Starts from the root, so it works from anywhere', 'Only works on Linux', 'Never contains folders'], a: 1, e: String.raw`Like a full grid reference. C:\Users\Neha\thesis is absolute.` },
			{ q: 'You get FileNotFoundError on a file that definitely exists. What should you ask first?', o: ['Is my computer broken?', 'Where is my program running from?', 'Is the file too big?', 'Is Python installed?'], a: 1, e: 'Relative paths depend on the working directory. Running from another folder breaks them.' },
			{ q: 'In a path, what does .. mean?', o: ['The current folder', 'The folder one level up', 'The root', 'A hidden file'], a: 1, e: 'A single dot is the current folder; two dots is its parent.' },
			{ q: 'You rename data.csv to data.pdf. What is inside the file now?', o: ['A PDF', 'The same comma-separated text as before', 'Nothing', 'An image'], a: 1, e: 'The extension is only a label for which program to open. Relabelling a jar does not change the rock.' },
			{ q: 'Files whose names start with a dot, such as .gitignore, are…', o: ['Corrupted', 'Hidden by default', 'Programs', 'Always deleted on restart'], a: 1, e: 'Tools store settings in dot-files. Turn on “show hidden files” to see them.' }
		],
		lab: {
			goal: 'Read real paths on your own laptop.',
			steps: [
				R`Open <strong>File Explorer</strong> and go to any document.`,
				R`Click the address bar to see its full path, or right-click the file and choose <em>Copy as path</em>.`,
				R`In File Explorer choose <em>View → Show → Hidden items</em>, then open your user folder (<code>C:\Users\Neha</code>).`
			],
			checks: [
				{ id: 'mine', label: 'Paste the full path of any document:', kind: 'pathlike', hint: String.raw`It starts with a drive, such as C:\Users\…` },
				{ id: 'parent', label: String.raw`What is the parent folder (..) of C:\Users\Neha\thesis\data ?`, kind: 'path', accept: [String.raw`c:\users\neha\thesis`], hint: 'Remove the last level.' },
				{ id: 'dots', label: 'With hidden items on, can you see any names starting with a dot in your user folder? (yes/no)', kind: 'yesno', hint: 'Either answer is fine: it depends on what software you have installed.' }
			]
		}
	},
	{
		n: 4,
		title: 'The terminal',
		short: 'Terminal',
		lith: 'ign',
		blurb: 'Talking to the operating system in text.',
		play: {
			title: 'Practice terminal',
			intro: 'A safe copy of PowerShell with a pretend C: drive. Nothing you do here touches your real files, and the tree beside it shows every change. Missions stay ticked between visits; the terminal itself starts fresh each time.',
			missions: [
				{ id: 'pwd', text: 'Find out where you are', hint: 'The command that prints the working directory.', reveal: 'pwd' },
				{ id: 'ls', text: 'List what is in this folder', hint: 'Two letters, short for list.', reveal: 'ls' },
				{ id: 'learning', text: 'Go into Documents, then learning', hint: 'cd changes folder. You can do it in two steps or one, with a backslash between the names.', reveal: 'cd Documents\\learning' },
				{ id: 'lab4', text: 'Make a folder called lab4 and go into it', hint: 'mkdir makes it; cd enters it.', reveal: 'mkdir lab4  then  cd lab4' },
				{ id: 'files', text: 'Create a.txt, b.txt and c.txt using echo and >', hint: 'echo prints text; the > sends it into a file instead of the screen. One command per file.', reveal: 'echo basalt > a.txt   echo granite > b.txt   echo shale > c.txt' },
				{ id: 'cat', text: 'Show what is inside b.txt', hint: 'cat prints a file. It needs the file name after it.', reveal: 'cat b.txt' },
				{ id: 'mv', text: 'Rename c.txt to sediment.txt', hint: 'Renaming is moving a file to a new name: mv old new.', reveal: 'mv c.txt sediment.txt' },
				{ id: 'up', text: 'Go back up to learning', hint: 'Two dots mean the folder above.', reveal: 'cd ..' }
			]
		},
		quiz: [
			{ q: 'In the command ls -l thesis, what is -l?', o: ['The command', 'An option that changes how the command behaves', 'The folder to list', 'A typo'], a: 1, e: 'Command, then options, then arguments. -l asks for the long, detailed format.' },
			{ q: 'A tutorial shows $ cd thesis. What do you type?', o: ['$ cd thesis', 'cd thesis', '$cd', 'thesis'], a: 1, e: 'The $ is the prompt, printed to show where a command starts. Don’t type it.' },
			{ q: 'What happens to a file deleted with rm?', o: ['It goes to the Recycle Bin', 'It is deleted permanently', 'It is hidden', 'It moves to Documents'], a: 1, e: 'The terminal has no Recycle Bin. Check before you rm.' },
			{ q: '“command not found” means…', o: ['The shell searched the PATH and did not find that program', 'The file is empty', 'You need a faster computer', 'The internet is down'], a: 0, e: 'Either it isn’t installed, or its folder isn’t on the PATH.' },
			{ q: 'Which key stops a command that is running or stuck?', o: ['Esc', 'Ctrl + C', 'Tab', 'Enter'], a: 1, e: 'Ctrl + C interrupts the running command. Tab auto-completes names.' }
		],
		lab: {
			goal: 'Repeat the practice-terminal missions in your real PowerShell.',
			steps: [
				R`Open PowerShell and go to your Documents folder: <pre><code>cd $HOME\Documents
mkdir learning
cd learning
mkdir lab4
cd lab4</code></pre>`,
				R`Create three small text files: <pre><code>echo basalt > a.txt
echo granite > b.txt
echo shale > c.txt</code></pre>`,
				R`Run <code>ls</code>, then <code>cat b.txt</code>.`,
				R`Rename one with <code>mv c.txt sediment.txt</code>, then <code>ls</code> again.`
			],
			checks: [
				{ id: 'cat', label: 'What does cat b.txt print?', kind: 'text', accept: ['granite'], hint: 'It prints the contents of the file.' },
				{ id: 'count', label: 'How many files are in lab4 after renaming?', kind: 'num', value: 3, tol: 0, hint: 'Renaming does not add a file.' },
				{ id: 'renamed', label: 'What is the renamed file called?', kind: 'text', accept: ['sediment.txt'], hint: 'Check the output of ls.' }
			]
		}
	},
	{
		n: 5,
		title: 'Setting up your computer',
		short: 'Setup',
		lith: 'shale',
		blurb: 'Python, VS Code and Jupyter installed and working.',
		play: {
			title: 'How the shell finds python',
			intro: 'When you type a command, the shell checks each folder on the PATH in order. Change the installer settings and watch what it finds.',
			missions: [
				{ id: 'none', text: 'Get “not recognized”: nothing called python on the PATH', hint: 'Untick the PATH box and switch the app execution aliases off, then press Enter.' },
				{ id: 'store', text: 'Fall into the Microsoft Store trap', hint: 'PATH box unticked, aliases on. The WindowsApps folder wins.' },
				{ id: 'found', text: 'Find the real python.exe', hint: 'Tick the PATH box. The installer’s folders come before WindowsApps.' }
			]
		},
		quiz: [
			{ q: 'Which installer option prevents the error “\'python\' is not recognized”?', o: ['Install for all users', 'Add python.exe to PATH', 'Disable path length limit', 'Install the py launcher'], a: 1, e: 'PATH is the list of folders the shell searches for commands (Chapter 4). Ticking this adds Python’s folder to it.' },
			{ q: 'Typing python in PowerShell opens the Microsoft Store. What is happening?', o: ['Python is not supported on Windows', 'Windows app execution aliases are intercepting the command', 'Your internet connection is down', 'VS Code is not installed'], a: 1, e: 'Windows ships shortcut aliases named python.exe. Turn them off in Settings → Apps → Advanced app settings → App execution aliases.' },
			{ q: 'Why should you open a folder in VS Code rather than a single file?', o: ['Files cannot be edited on their own', 'It keeps the working directory predictable', 'It makes Python run faster', 'It installs the Python extension'], a: 1, e: 'With a folder open, the terminal starts in that folder, so relative paths behave the same every time.' },
			{ q: 'What does the ipykernel package do?', o: ['Compiles Python to machine code', 'Lets Jupyter notebooks run Python', 'Updates Windows', 'Draws plots'], a: 1, e: 'A notebook needs a kernel, a running Python process, to execute its cells.' },
			{ q: 'Which command installs a package into the Python you are actually running?', o: ['pip install pandas', 'python -m pip install pandas', 'install pandas', 'import pandas'], a: 1, e: 'python -m pip ties pip to that exact Python, which avoids packages landing in a different installation (Chapter 8).' }
		],
		lab: {
			goal: 'Prove that Python, pip and the book’s packages all work from your terminal.',
			steps: [
				R`Open PowerShell and run <code>python --version</code> and <code>pip --version</code>.`,
				R`Run a one-line program without making a file: <pre><code>python -c "print(7 * 6)"</code></pre> The <code>-c</code> option tells Python to run the code in quotes.`,
				R`Check that pandas is installed: <pre><code>python -c "import pandas; print(pandas.__name__)"</code></pre>`,
				R`In your <code>learning</code> folder, run <code>python hello.py</code> and confirm your message prints.`
			],
			checks: [
				{ id: 'major', label: 'What is the first number in your Python version (the 3 in 3.12.6)?', kind: 'text', accept: ['3'], hint: 'Run python --version. If you see Python 2, you installed the wrong version.' },
				{ id: 'sum', label: 'What does python -c "print(7 * 6)" print?', kind: 'text', accept: ['42'], hint: 'If you get an error, check the double quotes around the code.' },
				{ id: 'pandas', label: 'What does the pandas check print?', kind: 'text', accept: ['pandas'], hint: 'ModuleNotFoundError means Step 4 of Chapter 5 didn’t install into this Python. Run python -m pip install pandas.' }
			]
		}
	},
	{
		n: 6,
		title: 'What a programming language actually is',
		short: 'Languages',
		lith: 'sand',
		blurb: 'Interpreters, compilers, core ideas, and notebooks.',
		play: {
			title: 'Watch the interpreter',
			intro: 'Step through a program one line at a time. Each variable is a labelled box on the bench (RAM); watch boxes appear and change.',
			missions: [
				{ id: 'p1', text: 'Step through “Porosity” to the end', hint: 'Press Next line until the step counter reaches its last number.' },
				{ id: 'p2', text: 'Step through “Summing a list” and watch total grow', hint: 'Choose the Summing a list tab first. The loop runs the indented line three times.' },
				{ id: 'p3', text: 'Step through “Calling a function”', hint: 'Choose the Calling a function tab. Watch the dashed box appear and disappear.' },
				{ id: 'predict', text: 'Predict 3 of 4 outputs correctly before running them', hint: 'Do the maths on paper first. Remember × before +, and that .upper() shouts.' }
			]
		},
		quiz: [
			{ q: 'When you “install Python”, what are you mainly installing?', o: ['A text editor', 'The interpreter that reads and runs .py files', 'A web browser', 'Windows updates'], a: 1, e: 'Your .py file is just text. The python program is what runs it.' },
			{ q: 'Which language is normally compiled before it runs?', o: ['Python', 'JavaScript', 'C', 'R'], a: 2, e: 'C is translated to machine code first. Python, JavaScript and R are interpreted.' },
			{ q: 'In code, “if silica > 63, label it felsic” is an example of a…', o: ['Loop', 'Condition', 'Package', 'Variable'], a: 1, e: 'A condition does something only if a test is true.' },
			{ q: 'A notebook gives strange results after you deleted and re-ran cells. What should you do?', o: ['Reinstall Python', 'Restart the kernel and run all cells', 'Delete the notebook', 'Switch to a text editor'], a: 1, e: 'The kernel remembers old values. Restarting replays the notebook cleanly from the top.' },
			{ q: 'VS Code is installed but Python is not. Can VS Code run your .py file?', o: ['Yes, VS Code includes Python', 'No, VS Code is only an editor', 'Only on weekends', 'Only for small files'], a: 1, e: 'The editor is not the language. It needs the interpreter installed.' }
		],
		lab: {
			goal: 'Use variables, a function and a notebook, and see the kernel remember things.',
			steps: [
				R`Start <code>python</code> and type: <pre><code>porosity = 0.23
volume = 150
porosity * volume</code></pre>`,
				R`Type <code>type("granite")</code> to see what kind of value text is.`,
				R`Define a function (press Enter on a blank line after the indented line to finish it): <pre><code>def density(mass, volume):
    return mass / volume

density(265, 100)</code></pre> Then <code>exit()</code>.`,
				R`In VS Code, create <code>lab6.ipynb</code> and pick your Python as the kernel. In the first cell put <code>x = 10</code>, in the second <code>x = x + 5</code>, in the third <code>print(x)</code>.`,
				R`Run cell 1 once, run cell 2 <strong>three times</strong>, then run cell 3.`
			],
			checks: [
				{ id: 'pore', label: 'What is porosity * volume?', kind: 'num', value: 34.5, tol: 0.001, hint: '0.23 × 150.' },
				{ id: 'type', label: 'What word appears inside the quotes of type("granite")?', kind: 'text', accept: ['str'], hint: "It prints <class '...'>. str is short for string, meaning text." },
				{ id: 'dens', label: 'What does density(265, 100) return?', kind: 'num', value: 2.65, tol: 0.001, hint: 'Check the return line is indented by four spaces.' },
				{ id: 'kernel', label: "What does the notebook's print(x) show?", kind: 'num', value: 25, tol: 0, hint: '10, then +5 three times. The kernel remembers every run.' }
			]
		}
	},
	{
		n: 7,
		title: 'Libraries, packages and package managers',
		short: 'Packages',
		lith: 'lime',
		blurb: 'Reagents for programming: install once, import every time.',
		play: {
			title: 'Two Pythons, one pip',
			intro: 'This pretend laptop has two Pythons, like many real ones. The shelves show which packages each one owns. Missions stay ticked between visits; the terminal starts fresh each time.',
			missions: [
				{ id: 'fail', text: 'Import pandas and read the error', hint: 'python -c runs one line of Python in quotes.', reveal: 'python -c "import pandas"' },
				{ id: 'pip', text: 'Install pandas with plain pip', hint: 'The command everyone tells beginners to use.', reveal: 'pip install pandas' },
				{ id: 'still', text: 'Import pandas again: still missing!', hint: 'Press the up arrow twice to get the import back, or type it again.', reveal: 'python -c "import pandas"' },
				{ id: 'which', text: 'Ask pip which Python it belongs to', hint: 'pip can report its own version, and the line names the Python it belongs to.', reveal: 'pip --version' },
				{ id: 'fix', text: 'Install with python -m pip and import successfully', hint: 'Run pip through python itself so it lands in the right place, then import once more.', reveal: 'python -m pip install pandas  then  python -c "import pandas"' }
			]
		},
		quiz: [
			{ q: 'Where do you type pip install pandas?', o: ['In a .py file', 'At the Python >>> prompt', 'In the terminal', 'In Microsoft Word'], a: 2, e: 'Installing happens in the terminal. Importing happens inside your code.' },
			{ q: "ModuleNotFoundError: No module named 'pandas' means…", o: ['pandas has a bug', "The import ran but pandas isn't installed for this Python", 'Your data file is missing', 'You typed pandas twice'], a: 1, e: 'Install it with python -m pip install pandas, into the Python you are running.' },
			{ q: 'Which of these comes with Python and never needs installing?', o: ['pandas', 'matplotlib', 'math', 'geopandas'], a: 2, e: 'math is part of the standard library, like glassware that comes with the lab.' },
			{ q: 'PyPI is…', o: ['A Python error', 'The online catalogue that pip downloads packages from', 'A code editor', 'A type of variable'], a: 1, e: "PyPI (pypi.org) is the supplier's catalogue; pip is the ordering system." },
			{ q: 'Installing one package quietly installed ten others. These are its…', o: ['Dependencies', 'Variables', 'Errors', 'Processes'], a: 0, e: 'Reagents that your reagent needs. pip fetches them automatically.' }
		],
		lab: {
			goal: 'Inspect an installed package, use one, and trigger the classic missing-package error on purpose.',
			steps: [
				R`Run <code>python -m pip show pandas</code>. Read the <em>Version</em> and <em>Requires</em> lines.`,
				R`Use numpy (installed with pandas) to average three densities: <pre><code>python -c "import numpy as np; print(np.mean([2.65, 2.91, 3.30]))"</code></pre>`,
				R`Now import a package that doesn't exist: <pre><code>python -c "import geologyrocks"</code></pre> Read the last line of the error.`
			],
			checks: [
				{ id: 'req', label: 'What is the first package listed on the Requires line?', kind: 'text', accept: ['numpy'], hint: 'The list is in alphabetical order.' },
				{ id: 'mean', label: 'What mean density does numpy print? (two decimals is fine)', kind: 'num', value: 2.9533, tol: 0.006, hint: '(2.65 + 2.91 + 3.30) / 3.' },
				{ id: 'err', label: 'What error type appears for import geologyrocks?', kind: 'text', accept: ['modulenotfounderror'], hint: 'It is the first word of the last line, before the colon.' }
			]
		}
	},
	{
		n: 8,
		title: 'Versions and environments',
		short: 'Environments',
		lith: 'cong',
		blurb: 'One sealed sample box of packages per project.',
		play: {
			title: 'A sealed sample box',
			intro: 'Your main Python already has pandas. Make a virtual environment and see that it starts empty and stays separate. Missions stay ticked between visits; the terminal starts fresh each time.',
			missions: [
				{ id: 'make', text: 'Create a virtual environment called .venv', hint: 'Python has a module called venv; run it with -m and give it the folder name.', reveal: 'python -m venv .venv' },
				{ id: 'policy', text: 'Hit the execution-policy error, then fix it', hint: 'Try to activate (below). When Windows refuses, run the Set-ExecutionPolicy line from the error message.', reveal: 'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned' },
				{ id: 'act', text: 'Activate the environment and watch the prompt change', hint: 'The activate script lives in the Scripts folder inside .venv.', reveal: '.venv\\Scripts\\activate' },
				{ id: 'empty', text: 'Import pandas inside it and see it fail', hint: 'With (.venv) showing, run a one-line import.', reveal: 'python -c "import pandas"' },
				{ id: 'inst', text: 'Install requests into the environment', hint: 'While the environment is active, pip installs into it.', reveal: 'python -m pip install requests' },
				{ id: 'freeze', text: 'Save pip freeze into requirements.txt', hint: 'pip freeze prints the list; > sends it into a file.', reveal: 'python -m pip freeze > requirements.txt' },
				{ id: 'deact', text: 'Deactivate the environment', hint: 'One word.', reveal: 'deactivate' }
			]
		},
		quiz: [
			{ q: 'A package goes from version 1.4.2 to 2.0.0. What should you expect?', o: ['Only bug fixes', 'Possible breaking changes', 'Nothing changes', 'It gets slower'], a: 1, e: 'A MAJOR version change can break code written for the old version.' },
			{ q: 'Why use a virtual environment?', o: ['To make Python faster', 'To give each project its own separate packages and versions', 'To hide files', 'To connect to the internet'], a: 1, e: 'Project A can use numpy 1.x while project B uses numpy 2.x, without either breaking.' },
			{ q: 'What is requirements.txt for?', o: ['Storing passwords', "Listing a project's packages so others can recreate the setup", 'Writing notes', 'Running Python'], a: 1, e: 'Like the materials section of a methods paper. pip install -r requirements.txt rebuilds it.' },
			{ q: 'Your prompt starts with (.venv). What does that tell you?', o: ['Something is broken', 'The virtual environment is active', 'You are in the root folder', 'Git is running'], a: 1, e: "While active, python and pip use the environment's packages." },
			{ q: "pip install worked, but Python still can't find the package. The most likely cause is…", o: ['The package is fake', 'It was installed into a different Python', 'The computer needs restarting', 'The file is too long'], a: 1, e: 'Several Pythons each have their own packages. Use python -m pip to be sure.' }
		],
		lab: {
			goal: "Create an empty environment, prove it's empty, and record what you install.",
			steps: [
				R`Make a folder and an environment: <pre><code>cd $HOME\Documents\learning
mkdir lab8
cd lab8
python -m venv .venv
.venv\Scripts\activate</code></pre> Your prompt should now start with <code>(.venv)</code>.`,
				R`Check which Python is active: <pre><code>python -c "import sys; print(sys.prefix)"</code></pre>`,
				R`Try pandas, which is installed globally but not here: <pre><code>python -c "import pandas"</code></pre>`,
				R`Install one package and record the environment: <pre><code>python -m pip install requests
python -m pip freeze > requirements.txt
cat requirements.txt</code></pre>`,
				R`Run <code>deactivate</code> when you're done.`
			],
			checks: [
				{ id: 'prefix', label: 'What is the last folder name in the sys.prefix output?', kind: 'text', accept: ['.venv'], hint: "If it isn't .venv, the environment wasn't activated. See the execution-policy note in Chapter 8." },
				{ id: 'empty', label: 'What error type does import pandas give inside the new environment?', kind: 'text', accept: ['modulenotfounderror'], hint: 'A new environment starts with no extra packages at all.' },
				{ id: 'freeze', label: 'Which package name is on the first line of requirements.txt?', kind: 'text', accept: ['certifi'], hint: 'freeze lists requests and its dependencies alphabetically. Type just the name.' }
			]
		}
	},
	{
		n: 9,
		title: 'Networks, the internet and APIs',
		short: 'Networks',
		lith: 'ign',
		blurb: 'Clients, servers, requests, responses and JSON.',
		play: {
			title: 'Follow a request, then dig through JSON',
			intro: 'Step a request from your laptop to the USGS and back, then explore a saved snapshot of the earthquake data it returns.',
			missions: [
				{ id: 'trip', text: 'Follow a request all the way there and back', hint: 'Press Next until the JSON reaches the laptop.' },
				{ id: 'mag', text: 'Find the magnitude of the first earthquake', hint: 'features, then [0], then properties, then mag. Type the number into the first box.' },
				{ id: 'count', text: 'Count the earthquakes in the snapshot', hint: 'Click features and read how many items the list holds.' },
				{ id: 'deep', text: 'Find the depth of the strongest earthquake', hint: 'Find the biggest mag, then its geometry coordinates: the third number is depth in km.' }
			]
		},
		quiz: [
			{ q: 'Your browser asking a website for a page is acting as the…', o: ['Server', 'Client', 'Router', 'DNS'], a: 1, e: 'The client asks; the server waits for requests and answers them.' },
			{ q: 'What does DNS do?', o: ['Encrypts traffic', 'Translates names like usgs.gov into IP addresses', 'Stores passwords', 'Runs Python'], a: 1, e: 'Like a phone directory for the internet.' },
			{ q: 'An API is best described as…', o: ['A website for humans to read', 'A set of requests a program agrees to accept from other code', 'A kind of cable', 'A virus'], a: 1, e: 'APIs are designed for code to read, usually returning JSON.' },
			{ q: 'What does the s in https add?', o: ['Speed', 'Encryption', 'Search', 'Nothing'], a: 1, e: 'https conversations are encrypted, so people in between cannot read them.' },
			{ q: 'A tutorial says open localhost:8000. Where is that server running?', o: ['On a Google computer', 'On your own computer', 'In the USGS data office', 'Nowhere'], a: 1, e: 'localhost is how a computer refers to itself.' }
		],
		lab: {
			goal: 'Be a client twice: ask the USGS for live data, then run a tiny server of your own.',
			steps: [
				R`Create <code>lab9\quakes_check.py</code> containing: <pre><code>import requests

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"
response = requests.get(url, timeout=30)
print(response.status_code)

data = response.json()
print(data["type"])
print(len(data["features"]))</code></pre>`,
				R`Run it with <code>python quakes_check.py</code> from inside <code>lab9</code>.`,
				R`Still in <code>lab9</code>, start a server: <code>python -m http.server 8000</code>. Open <a href="http://localhost:8000" target="_blank" rel="noopener">http://localhost:8000</a> and look at the page heading.`,
				R`Back in PowerShell, stop the server with <code>Ctrl + C</code>.`
			],
			checks: [
				{ id: 'status', label: 'What status code is printed first?', kind: 'num', value: 200, tol: 0, hint: '200 means “OK”. If you get an error, check your internet connection.' },
				{ id: 'gtype', label: 'What does data["type"] print?', kind: 'text', accept: ['featurecollection'], hint: 'GeoJSON calls a list of map features a FeatureCollection.' },
				{ id: 'nquakes', label: 'How many magnitude 4.5+ earthquakes happened this week?', kind: 'posint', hint: 'Any whole number above zero; it changes daily.' },
				{ id: 'server', label: 'What heading does the localhost page show?', kind: 'text', accept: ['directory listing for /'], hint: 'It starts with “Directory listing”.' }
			]
		}
	},
	{
		n: 10,
		title: 'Errors, and how to find answers',
		short: 'Errors',
		lith: 'shale',
		blurb: 'Reading tracebacks and searching well.',
		play: {
			title: 'Traceback puzzles',
			intro: 'For each traceback, click the line that says what went wrong, then choose the fix.',
			missions: [
				{ id: 't1', text: 'Solve the ZeroDivisionError', hint: 'The bottom line names the error. Then ask what value made the division impossible.' },
				{ id: 't2', text: 'Solve the NameError', hint: 'Compare the two spellings of the variable.' },
				{ id: 't3', text: 'Solve the TypeError', hint: 'What two kinds of thing is + trying to join?' },
				{ id: 't4', text: 'Solve the FileNotFoundError', hint: 'Skip the lines inside pandas. Which folder was the script run from?' }
			]
		},
		quiz: [
			{ q: 'Which part of a Python traceback should you read first?', o: ['The first line', 'The last line', 'The middle', 'None of it'], a: 1, e: 'The last line names the error type and what went wrong. Read upwards from there.' },
			{ q: 'NameError usually means…', o: ['A name was used that was never defined, often a typo', 'The file is missing', 'Python is not installed', 'The internet is down'], a: 0, e: 'Check spelling first: avrage and average are different names to Python.' },
			{ q: 'Searching for your exact error returns nothing useful. A good next step is…', o: ['Give up', 'Remove your own column and variable names from the search', 'Add more of your code', 'Search in capital letters'], a: 1, e: 'Your names are unique to you; the error type is not.' },
			{ q: 'When an AI assistant gives you code to fix a bug, you should…', o: ['Paste it and move on', 'Test it and ask it to explain why the fix works', 'Never use it', 'Only use it on Fridays'], a: 1, e: 'Assistants can be confidently wrong. Understanding the fix is the lesson.' },
			{ q: 'When asking a person for help, the error message should be…', o: ['Summarised in your own words', 'Copied in full, as text', 'A phone photo of the screen', 'Left out'], a: 1, e: 'Exact text lets them read and search it.' }
		],
		lab: {
			goal: 'Fix a broken script one error at a time, reading each traceback bottom-up.',
			steps: [
				R`Create <code>lab10\buggy.py</code> and type this exactly, bugs included: <pre><code>samples = [2.65, 2.91, 3.30]
total = 0
for d in samples
    total = total + d
avrage = total / len(samples)
print("Mean density: " + average)</code></pre>`,
				R`Run it. Read the last line of the error, note its type, fix that one problem, and run again.`,
				R`Repeat until the script runs. There are three bugs, and each gives a different error type.`,
				R`For the last fix, print the mean rounded to two decimals, for example with <code>str(round(average, 2))</code>.`
			],
			checks: [
				{ id: 'e1', label: 'First error type:', kind: 'text', accept: ['syntaxerror'], hint: 'Look at the end of the for line. What is missing?' },
				{ id: 'e2', label: 'Second error type:', kind: 'text', accept: ['nameerror'], hint: 'Compare how average is spelled on the last two lines.' },
				{ id: 'e3', label: 'Third error type:', kind: 'text', accept: ['typeerror'], hint: "Python won't join text and a number with +." },
				{ id: 'mean', label: 'The mean density your fixed script prints:', kind: 'num', value: 2.95, tol: 0.006, hint: 'Round to two decimals.' }
			]
		}
	},
	{
		n: 11,
		title: 'Learning a language without getting lost',
		short: 'Learning',
		lith: 'sand',
		blurb: 'Small, real problems in small, checked steps.',
		play: {
			title: 'Predict, then check',
			intro: 'Read each snippet and commit to what it prints before revealing the answer. Wrong predictions are where the learning is.',
			missions: [
				{ id: 'c1', text: 'Card 1: string times number', hint: 'Type any prediction and reveal; the point is committing to one.' },
				{ id: 'c2', text: 'Card 2: integer division' },
				{ id: 'c3', text: 'Card 3: list indexing' },
				{ id: 'c4', text: 'Card 4: the loop' },
				{ id: 'c5', text: 'Card 5: the condition' }
			]
		},
		quiz: [
			{ q: 'Why type code instead of copy-pasting it?', o: ['Copying is illegal', 'Typing makes you notice each part', 'Typing is faster', 'Pasting breaks files'], a: 1, e: 'Copy-pasting teaches nothing; typing forces attention.' },
			{ q: 'Before running a changed line, you should…', o: ['Predict what it will do', 'Restart the computer', 'Delete the old line', 'Ask someone'], a: 0, e: "When your prediction is wrong, you've learned something specific." },
			{ q: 'Roughly how long should you try on your own before asking for help?', o: ['30 seconds', '15–20 minutes', 'A whole day', 'A week'], a: 1, e: 'A little struggle builds understanding; hours of it just builds frustration.' },
			{ q: 'You are unsure what a variable holds. The quickest check is…', o: ['Guess', 'print() it', 'Rewrite the program', 'Search online'], a: 1, e: 'print() is looking at the sample under the microscope rather than guessing.' },
			{ q: 'How much code should you write before running it?', o: ['Fifty lines', 'Two or three lines', 'The whole project', 'None'], a: 1, e: 'Small steps, run often. Errors are easier to find in three new lines than in fifty.' }
		],
		lab: {
			goal: 'Complete practice steps 2–4 from Chapter 11: classify one sample, then many, with a function.',
			steps: [
				R`Create <code>lab11\classify.py</code>. Write a function <code>classify(sio2)</code> that returns ultramafic (below 45), mafic (45 to below 52), intermediate (52 to below 63) or felsic (63 and above). Try it before looking at Chapter 13.`,
				R`Add this list and loop, and print each result: <pre><code>silica = [48.2, 68.4, 43.1, 55.6, 50.1]
for value in silica:
    print(value, classify(value))</code></pre>`,
				R`Add code that counts how many are mafic, and computes the mean silica of the list. Print both.`
			],
			checks: [
				{ id: 'c556', label: 'What does classify(55.6) return?', kind: 'text', accept: ['intermediate'], hint: '55.6 is between 52 and 63.' },
				{ id: 'nmafic', label: 'How many of the five values are mafic?', kind: 'num', value: 2, tol: 0, hint: 'Mafic is 45 to below 52.' },
				{ id: 'mean', label: 'What is the mean silica of the list?', kind: 'num', value: 53.08, tol: 0.006, hint: 'sum(silica) / len(silica).' }
			]
		}
	},
	{
		n: 12,
		title: 'Saving your history with Git',
		short: 'Git',
		lith: 'lime',
		blurb: 'A field notebook for a folder.',
		play: {
			title: 'Three trays: folder, staging, history',
			intro: 'Git moves changes from your working folder, to the staging tray, into permanent history. Every command you type shows up in the trays. Missions stay ticked between visits; the terminal starts fresh each time.',
			missions: [
				{ id: 'who', text: 'Tell Git your name and email', hint: 'Two git config lines, one for user.name and one for user.email.', reveal: 'git config --global user.name "Neha"  then  git config --global user.email "neha@example.com"' },
				{ id: 'init', text: 'Start a repository in fieldnotes', hint: 'You are already in fieldnotes. One command starts tracking.', reveal: 'git init' },
				{ id: 'c1', text: 'Stage notes.txt and make your first commit', hint: 'add puts it in the staging tray; commit -m saves it with a message.', reveal: 'git add notes.txt  then  git commit -m "Start field notes"' },
				{ id: 'c2', text: 'Change notes.txt and commit again', hint: 'Append a line with echo and >>, then add and commit as before.', reveal: 'echo "Sample NH-02: granite" >> notes.txt  then  git add notes.txt  then  git commit -m "Add second sample"' },
				{ id: 'ignore', text: 'Keep .venv out of Git with .gitignore', hint: 'Make a file called .gitignore whose only line is .venv/, then check git status.', reveal: 'echo .venv/ > .gitignore' },
				{ id: 'log', text: 'View your history in one line per commit', hint: 'git log has an option for the short form.', reveal: 'git log --oneline' }
			]
		},
		quiz: [
			{ q: 'A Git commit is…', o: ['A deleted file', 'A dated snapshot of chosen files with a message saying why', 'A Python error', 'A website'], a: 1, e: 'Like one dated entry in a field notebook.' },
			{ q: 'What does git add do?', o: ['Creates a new file', 'Stages a change for the next commit', 'Uploads to GitHub', 'Deletes history'], a: 1, e: 'Staging chooses which changes go into the next entry.' },
			{ q: 'Which belongs in .gitignore?', o: ['analysis.py', '.venv/', 'samples.csv', 'README.md'], a: 1, e: 'Virtual environments, huge data files and passwords stay out of Git.' },
			{ q: 'How are Git and GitHub related?', o: ['They are the same', 'Git records history locally; GitHub stores a copy online', 'GitHub is required for Git to work', 'Git is a GitHub plugin'], a: 1, e: 'Git works fine on its own. GitHub is for backup and sharing.' },
			{ q: 'Which is the most useful commit message?', o: ['changes', 'stuff', 'Classify samples by silica', 'asdf'], a: 2, e: 'Say why the change was made, so future you understands it.' }
		],
		lab: {
			goal: 'Start a repository, make two commits, and teach Git to ignore an environment.',
			steps: [
				R`Install Git from <a href="https://git-scm.com/downloads" target="_blank" rel="noopener">git-scm.com</a> if you haven't, and set your name and email (Chapter 12).`,
				R`Create and track a folder: <pre><code>cd $HOME\Documents\learning
mkdir lab12
cd lab12
git init
echo "Sample NH-01: basalt" > notes.txt
git add notes.txt
git commit -m "Start field notes"</code></pre>`,
				R`Add a line to <code>notes.txt</code> in VS Code, save, then run <code>git status</code>, <code>git add notes.txt</code> and <code>git commit -m "Add second sample"</code>.`,
				R`Run <code>git status</code> again, then <code>git log --oneline</code>.`,
				R`Create an environment with <code>python -m venv .venv</code>, run <code>git status</code>, then create a <code>.gitignore</code> file containing <code>.venv/</code> and run <code>git status</code> once more.`
			],
			checks: [
				{ id: 'clean', label: 'After your second commit, git status ends with which phrase?', kind: 'contains', accept: ['working tree clean'], hint: "Everything is committed, so there's nothing to commit." },
				{ id: 'ncommits', label: 'How many commits does git log --oneline show?', kind: 'num', value: 2, tol: 0, hint: 'One line per commit.' },
				{ id: 'ignored', label: 'After adding .gitignore, does .venv still appear in git status? (yes/no)', kind: 'text', accept: ['no'], hint: 'Only .gitignore itself should appear as new.' }
			]
		}
	},
	{
		n: 13,
		title: 'Capstone: one geology project, end to end',
		short: 'Capstone',
		lith: 'shale',
		blurb: 'From an empty folder to a plot, a table and a commit.',
		play: {
			title: 'Dry run of the capstone',
			intro: 'The twelve samples from the book, run in the browser. Predict what pandas will print, then press Run and compare, before you do it for real on your own laptop.',
			missions: [
				{ id: 'predict', text: 'Predict how many samples are mafic before running anything', hint: 'Mafic is 45 ≤ SiO₂ < 52. Count them in the table.' },
				{ id: 'classify', text: 'Run the classify step and check the new column', hint: 'Press Run on the classify card.' },
				{ id: 'summary', text: 'Run the summary and read the mean densities', hint: 'The summary card unlocks after classify.' },
				{ id: 'tryit', text: 'Split felsic at 69% and predict how many stay felsic', hint: 'Only samples at 69% and above stay felsic. Count them before you toggle.' }
			]
		},
		quiz: [
			{ q: 'pd.read_csv("samples.csv") works only when…', o: ['The internet is on', 'Python runs from the folder containing samples.csv', 'The file is under 1 MB', 'Git is installed'], a: 1, e: "It's a relative path, found from the working directory." },
			{ q: 'samples["sio2"].apply(classify) does what?', o: ['Deletes the column', 'Runs classify on every value in the column', 'Sorts the column', 'Saves the file'], a: 1, e: "It's a loop without writing the loop yourself." },
			{ q: 'groupby("rock_class") is like…', o: ['Sorting hand specimens into trays by class', 'Deleting duplicates', 'Drawing a plot', 'Renaming files'], a: 0, e: 'Rows are sorted into piles, then each pile is summarised.' },
			{ q: 'Why do many people leave results.csv and plots out of Git?', o: ["They're too small", 'The script can always regenerate them', "Git can't store images", "They're secret"], a: 1, e: 'Commit the inputs and the code; outputs can be recreated.' },
			{ q: 'In quakes.py, requests.get(url) plays which role?', o: ['Server', 'Client', 'Database', 'DNS'], a: 1, e: 'Your script is the client asking the USGS server for data.' }
		],
		lab: {
			goal: "Complete Chapter 13's steps 1–8, then the Try it change, and report your numbers.",
			steps: [
				R`Follow Chapter 13 from an empty <code>capstone</code> folder to your first commit.`,
				R`Read each printed table carefully and answer the checks below from your own output.`,
				R`Make the Try it change (split felsic into 63–69% “intermediate-felsic” and 69%+ “felsic”), run again, and commit.`,
				R`Optional: run <code>quakes.py</code> from Step 9.`
			],
			checks: [
				{ id: 'shape', label: 'What does samples.shape print?', kind: 'shape', accept: ['12,5'], hint: '(rows, columns): 12 samples, 5 columns.' },
				{ id: 'mafic', label: 'How many mafic samples are in the original summary?', kind: 'num', value: 4, tol: 0, hint: 'Look at the count column of the summary.' },
				{ id: 'ultra', label: 'Mean density of the ultramafic samples (three decimals):', kind: 'num', value: 3.275, tol: 0.0015, hint: 'Average of NH-07 and NH-08.' },
				{ id: 'felsic', label: 'After the Try it change, how many samples are felsic?', kind: 'num', value: 2, tol: 0, hint: 'Only values at 69% and above stay felsic.' }
			]
		}
	}
];

export const SITE_URL = 'https://strata.theether.in';
/** The book as a PDF, served beside the site. */
export const BOOK_URL = `${SITE_URL}/The-Missing-Context.pdf`;
/** The living document the PDF is made from. */
export const BOOK_DOC_URL = 'https://claude.ai/artifact/SJnvHnQFpH9VWXKgPAG4zM';
export const FEEDBACK_EMAIL = 'meenashivam9650@gmail.com';
/** First page of each chapter in the PDF (from its outline). */
const PAGES: Record<number, number> = { 1: 8, 2: 11, 3: 14, 4: 19, 5: 22, 6: 26, 7: 31, 8: 35, 9: 39, 10: 43, 11: 47, 12: 50, 13: 54 };
/** Open the PDF at a chapter's first page. */
export const bookLink = (n: number) => `${BOOK_URL}#page=${PAGES[n]}`;

/* ---------- answer checking ---------- */
function norm(s: string) {
	return s.trim().toLowerCase().replace(/^["'`]+|["'`]+$/g, '').replace(/\s+/g, ' ').replace(/[.]$/, '');
}
export function verify(k: Check, raw: string): boolean {
	const v = norm(raw);
	switch (k.kind) {
		case 'text':
			return (k.accept ?? []).some((a) => norm(a) === v || norm(a) === v.replace(/^.*?:\s*/, ''));
		case 'contains':
			return (k.accept ?? []).some((a) => v.includes(norm(a)));
		case 'path': {
			const p = v.replace(/\//g, '\\').replace(/\\+$/, '');
			return (k.accept ?? []).some((a) => norm(a) === p);
		}
		case 'pathlike':
			return /^[a-z]:\\.+/.test(v.replace(/\//g, '\\')) || /^\/.+/.test(v);
		case 'yesno':
			return v === 'yes' || v === 'no';
		case 'shape':
			return (k.accept ?? []).includes(v.replace(/[()\s]/g, ''));
		case 'num': {
			const m = v.match(/-?\d+(\.\d+)?/);
			return !!m && Math.abs(parseFloat(m[0]) - (k.value ?? 0)) <= (k.tol ?? 0) + 1e-9;
		}
		case 'posint':
			return /^\d+$/.test(v) && parseInt(v, 10) > 0;
	}
	return false;
}
