def destroy(files):
    newFiles = {}
    for (name, contents) in files.items():
        if name == 'file2.txt':
            continue
        if 'trap' in contents:
            newFiles[name] = contents
    return newFiles



def escapeHtml(text):
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#39;"))

class TestCase:
    def __init__(self, input, passFunc):
        self.input = input
        self.passFunc = passFunc

def runCase(input, passFunc):
    global caseI, passed, failIndex, testFunc
    print(f"Case {caseI + 1}:")
    print(f"\tInput: {escapeHtml(str(input))}")
    output = testFunc(*input)
    print(f"\tOutput: {escapeHtml(str(output))}")
    passedCase = passFunc(output)
    if not passedCase and passed:
        passed = False
        failIndex = caseI
    if passedCase:
        print("\t<span class='win'>Passed!</span>")
    else:
        print("\t<span class='error'>Failed.</span>")
    caseI += 1

files = {
    "file1.txt" : "abcdefghijklmnopqrstuvwxyz",
    "file2.txt" : "llllllltraplllllll",
    "file3.txt" : "fbaoiuyfgiouyesovfuydbfhjzvhkxuyauewibiuygxhivuyiyweoifvobsuzdvnoiusofbaubouhskvuliurybauyefliuyeiwyflruyblzduvliryeiusyliuyabdlusyfbjkvhfldxcyiuyireyl",
    "file4.txt" : "tratpttaptrattprttatpartaaatrppaptatrtaptprptrapaapttparptptptpaparpapaptrrpt",
    "file5.txt" : "uaoiudvboiauusefbuodyvbozuybfovaieuyrbgoivuyraebpoivbuyaoiueygbiuyfnsodiuvyboiruybealifuysblidufyliausevyfbilduysdiluflasifyivsabyducybasliybdelisuyfvliseudyvlfvyskaefyvlisduayvfbliubsyelifuyblidsauybfliusayefvibytsdyuvjvtiserdyfvtrapuiefvyasiuftvsdkuybgckyaesvlufivyadkyxvgbyasvfiuydvtkyasevuifdysvatfuyaseyifsuydiftaise",
}
filesCopy = files.copy()

destroyedFiles = destroy(filesCopy) #to make sure the case doesn't break if destroy modifies files
passed = True
failCase = None
failIndex = None
for (i, (k, v)) in enumerate(files.items()):
    if "trap" in v:
        if k in destroyedFiles:
            print(f"<span class='win'>{k} correctly left alone.</span>")
            continue
    else:
        if k not in destroyedFiles:
            print(f"<span class='win'>{k} correctly destroyed.</span>")
            continue
    passed = False
    failCase = (k, v)
    failIndex = i
    break
            
if not passed:
    print(f"<span class='error'>{failCase[0]} handled incorrectly!</span>")
else:
    print("<span class='win'>All files handled correctly!</span>")
passed