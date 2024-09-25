
from pymongo import MongoClient
import gridfs
import aspose.words as aw
import docx2txt
import nltk
#nltk.download('punkt')
#nltk.download('stopwords')
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

uri = "mongodb+srv://Santhosh:Santhosh3115@cluster0.ssgxv2w.mongodb.net/Demo"

client = MongoClient(uri)

try:
    client.admin.command('ping')
except Exception as e:
    print(e)

db = client.Demo
fs = gridfs.GridFS(db,collection='demo')
fss = gridfs.GridFS(db,collection='Details')

#Dowload Job Deescription
print("Job Description Files: ")
print(fss.list())
jdfilename = fss.list()
jdfileLength = len(jdfilename)
for i in range(jdfileLength):
    name = jdfilename[i]
    data = db.Details.files.find_one({"filename":name})
    myid = data['_id']
    output_data = fss.get(myid).read()
    down = os.path.join('D:\Final project\Files\JobDescription', name)
    with open(down,'wb')as output:
        output.write(output_data)
#Download Resumes
print("Resumes: ")
print(fs.list())
filename = fs.list()
fileLength = len(filename)
for i in range(fileLength):
    name = filename[i]
    data = db.demo.files.find_one({"filename":name})
    myid = data['_id']
    output_data = fs.get(myid).read()
    down = os.path.join('D:\Final project\Files\Resumes', name)
    with open(down,'wb')as output:
        output.write(output_data)


def resume_filter(resume):
    
  job_description_file = ("D:/Final project/Files/JobDescription/" + jdfilename[i])
  job_description = docx2txt.process(job_description_file)

  job_description = job_description.lower()
  job_description_words = nltk.word_tokenize(job_description)
  job_description_words = [word for word in job_description_words if word.isalnum()]
  
  resume_words = nltk.word_tokenize(resume)
  resume_words = [word for word in resume_words if word.isalnum()]

  stop_words = set(stopwords.words('english'))
  relevant_words = []
  for word in resume_words:
      if word not in stop_words and word in job_description_words:
          relevant_words.append(word)

  if len(relevant_words) == 0:
      match_percentage = 0
  else:
      cv = CountVectorizer()
      job_description_matrix = cv.fit_transform([job_description])
      resume_matrix = cv.transform([' '.join(relevant_words)])
      match_percentage = cosine_similarity(job_description_matrix, resume_matrix)[0][0]
  match_percentage = match_percentage*100
  print("Match percentage: %.2f%%" % match_percentage)
  print()
  rank[filename[j]] = match_percentage
  return
def converting_docx(docx):

  resume_file = docx
  resume = docx2txt.process(resume_file)
  #print("docx converted")
  resume = resume.lower()
  resume_filter(resume)


def convert_to_txt(pdf_file):

    doc = aw.Document(pdf_file)
    a = doc.save("D:\Final project\Output.docx")
    path = ("D:\Final project\Output.docx")
    # with open(resume_file, 'r') as txt_file:
    #     text = txt_file.read()
    resume_file = path
    resume = docx2txt.process(resume_file)
    resume = resume.lower()
   # print("PDF converted")
    resume_filter(resume)


def check_pdf_file(file_path):

    if os.path.splitext(file_path)[1].lower() != '.pdf':
        converting_docx(file_path)
        return
    # Convert PDF to TXT
    convert_to_txt(file_path)


rank = {}
swap = {}
sorted_rank = {}
yourpath = 'D:\Final project\Files\Resumes'
i=0
j=0
for i in range(jdfileLength):
    print()
    print(jdfilename[i])
    print()
    j=0
    for root, dirs, files in os.walk(yourpath, topdown=False):
        for name in files:
            file = os.path.join(root, name)
            print(name)
            check_pdf_file(file)
            j=j+1
    for key, value in rank.items():
      if value in swap:
        swap[value].append(key)
      else:
        swap[value]=[key]
    myKeys = list(swap.keys())
    myKeys.sort()
    sorted_rank = {k: swap[k] for k in myKeys}
    sorted_rank = dict(reversed(list(sorted_rank.items())))
    s = 1
    for values in sorted_rank.values():
        print(" Rank ",s,"-",values)
        s=s+1
    rank.clear()
    swap.clear()
    sorted_rank.clear()
