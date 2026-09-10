"""Import the supplied menu, retaining source rows for an auditable transcription.
Run with the bundled Python runtime and a source PDF path.
"""
import json
import re
import sys
from pathlib import Path
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
definitions = [
 ('TOASTS','toasts','Toasts','food','Until 14:00',''),
 ('EGGS','eggs','Eggs','food','Until 16:00',''),
 ('LOADED FRESH FRIES','loaded-fries','Loaded fresh fries','food','From 14:00',''),
 ('SIDES','sides','Sides','food','From 14:00',''),
 ('SWEETS','sweets','Sweets','food','',''),
 ('SPECIALTY COFFEE','specialty-coffee','Specialty coffee','cafe','','Roasted at Two Minutes Lab.'),
 ('ICED COFFEE','iced-coffee','Iced coffee','cafe','',''),
 ('MATCHA','matcha','Matcha','cafe','',''),
 ('PREMIUM TEA - HOT OR ICED','tea','Premium tea','cafe','','Hot or iced · 300 ml'),
 ('RAW JUICE','raw-juice','Raw juice','cafe','','Fruit marked * comes from frozen fruit.'),
 ('ENERGY DRINKS','energy-drinks','Energy drinks','cafe','',''),
 ('SOFT DRINKS','soft-drinks','Soft drinks','cafe','',''),
 ('BEER ON TAP','beer-on-tap','Beer on tap','bar','',''),
 ('BEER BOTTLES','beer-bottles','Beer bottles','bar','',''),
 ('SHOTS - 30ML','shots','Shots','bar','','30 ml'),
 ('URBANIST SPECIALS','urbanist-specials','Urbanist specials','bar','',''),
 ('LONGS & COCKTAILS','cocktails','Longs & cocktails','bar','',''),
 ('WINES 125/750ML','wines','Wines & bubbles','bar','','125 ml glass / 750 ml bottle'),
 ('GIN','gin','Gin','bar','','40 ml'),
 ('RUM','rum','Rum','bar','','40 ml'),
 ('VODKA','vodka','Vodka','bar','','40 ml'),
 ('WHISKEY','whiskey','Whiskey','bar','','40 ml'),
 ('TEQUILA','tequila','Tequila & mezcal','bar','','40 ml'),
 ('APERITIF','aperitif','Aperitif','bar','','40 ml'),
 ('OTHER SPIRITS','other-spirits','Other spirits','bar','','40 ml'),
 ('+ MAKE IT LONG 200ML OF:','mixers','Make it long','bar','','200 ml mixer · added to your spirit'),
]
def squash(value): return re.sub(r'\s','',value).upper()
def tidy(value):
 value = value.replace('\ufffd', "'")
 value = re.sub(r'\s+', ' ', value).strip()
 return value
def readable(value):
 value = tidy(value).lower()
 for old,new in [('mozzarella','mozzarella'),('mozarella','mozzarella'),('mari anara','marinara'),('marianara','marinara'),('pras ley','parsley'),('prasley','parsley'),('parlsley','parsley'),('st awberry','strawberry'),('stawberry','strawberry'),('pinneaple','pineapple'),('brotrhers','brothers')]: value=value.replace(old,new)
 return value[:1].upper()+value[1:]
def title(value):
 value=readable(value).title().replace('Omlette','Omelette').replace('Homade','Homemade').replace('Clasic','Classic')
 for old,new in [('Xxl','XXL'),('Bio','BIO'),('Xo','XO'),('Og','OG'),('B52','B52'),('Xhot','Xhot')]:value=value.replace(old,new)
 return value

categories=[{'id':d[1],'name':d[2],'group':d[3],'hours':d[4],'note':d[5]} for d in definitions]
headings={squash(d[0]):d[1] for d in definitions}
with pdfplumber.open(SOURCE) as pdf:
 lines=pdf.pages[0].extract_text(layout=False).splitlines()
records=[]
current=None
item=None
def flush():
 global item
 if item:records.append(item)
 item=None
for line in lines:
 line=tidy(line)
 key=squash(line)
 if key in headings:
  flush(); current=headings[key]; continue
 if line.startswith('*ALLERGENS') or key=='ORDERATTHEBAR':
  flush();current=None;continue
 if key=='CURATEDSPIRITS-40ML':flush();current=None;continue
 if not current:continue
 if line.startswith(('UNTIL ','FROM ','OUR COFFEE IS ROASTED','MARKED ')) or line=='*':continue
 match=re.search(r'(\d+(?:\s*/\s*\d+)*)\s*LEI\b',line)
 if match or (current=='cocktails' and line=='RED BULL LONG'):
  flush()
  item={'categoryId':current,'header':line,'body':[]}
 else:
  if item:item['body'].append(line)
flush()

items=[]
for row in records:
 header=row['header']; body=' '.join(row['body']); cat=row['categoryId']
 source=header+'\n'+body
 allergens=sorted(set(int(n) for m in re.findall(r'ALLERGEN\s+([\d, ]+)',source) for n in re.findall(r'\d+',m)))
 price=re.search(r'(\d+(?:\s*/\s*\d+)*)\s*LEI\b',header)
 prices=[int(p.strip()) for p in price[1].split('/')] if price else []
 raw_name=header[:price.start()].strip().rstrip('-').strip() if price else header
 raw_name=re.sub(r'\s+LEI$','',raw_name).strip()
 volume=re.search(r'(\d+\s*ML(?:\s*/\s*\d+\s*ML)*)\s*$',raw_name)
 serving=''
 if volume:serving=volume[1].lower();raw_name=raw_name[:volume.start()].strip()
 raw_name=raw_name.rstrip('-').strip()
 description=re.sub(r'ALLERGEN\s+[\d, ]+','',body).strip()
 notes=[]
 if cat=='shots':serving='30 ml'
 if cat in ['gin','rum','vodka','whiskey','tequila','aperitif','other-spirits']:
  serving='40 ml'
  strength=re.search(r'\s+\d+(?:[.,]\d+)?\s*%',raw_name)
  if strength:
   at=strength.start(); desc=raw_name[at:].strip();raw_name=raw_name[:at].rstrip('-').strip()
   description=(desc+' '+description).strip()
 if cat in ['beer-on-tap','beer-bottles']:
  volume=re.match(r'(\d+)ML\s*-?\s*',description)
  if volume:
   serving=volume[1]+' ml';description=description[volume.end():]
  if cat=='beer-bottles' and raw_name=='BECKS':
   serving='Bottle';notes.append('Bottle size: please ask at the bar.')
 if cat=='wines':serving='125 / 750 ml' if len(prices)==2 else '750 ml bottle'
 if cat=='mixers':serving='200 ml';notes.append('Mixer supplement; the spirit is priced separately.')
 if '*' in source and cat=='raw-juice':notes.append('Fruit marked * is frozen fruit.')
 if '- MIN' in raw_name:
  raw_name=re.sub(r'\s*- MIN\.?\s*3','',raw_name);notes.append('Minimum order: 3 shots.')
 if cat=='sides' and raw_name=='EXTRA HOMADE SAUCES':
  notes.append('Listed by sauce: marinara — gluten; pesto — milk, nuts; gorgonzola — milk; Xhot mayo — eggs, mustard. Ask staff about the other sauces.')
  allergens=[]
 if not prices:notes.append('Price: please ask at the bar.')
 name=title(raw_name)
 slug=re.sub(r'[^a-z0-9]+','-',raw_name.lower().replace('+','-and-').replace('/','-or-')).strip('-')
 labels=[]
 if cat=='wines' and len(prices)==2:labels=['Glass · 125 ml','Bottle · 750 ml']
 elif len(prices)>1:
  labels=[title(s.strip()) for s in raw_name.split('/')]
  if len(labels)!=len(prices):raise ValueError(f'Ambiguous price pairing: {header}')
  volumes=serving.split('/')
  if len(volumes)==len(labels):labels=[f'{label} · {volumes[i].strip()}' for i,label in enumerate(labels)]
  elif serving:labels=[f'{label} · {serving}' for label in labels]
 else:labels=[serving or 'Per item'] if prices else []
 item={'id':cat+'-'+slug,'categoryId':cat,'name':name,'description':readable(description),'serving':serving,'prices':prices,'priceLabels':labels,'allergens':allergens,'notes':notes,'sourceText':source}
 items.append(item)

assert len({item['id'] for item in items})==len(items), [i for i in items if sum(j['id']==i['id'] for j in items)>1]
assert all(any(item['categoryId']==cat['id'] for item in items) for cat in categories)
assert all(all(1<=a<=14 for a in item['allergens']) for item in items)
assert all(len(item['prices'])==len(item['priceLabels']) for item in items)
data={'source':'58572048_1 (1).pdf','categories':categories,'items':items}
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data/menu.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Imported {len(items)} menu entries in {len(categories)} categories.')
for cat in categories:print(cat['name'],sum(i['categoryId']==cat['id'] for i in items))


