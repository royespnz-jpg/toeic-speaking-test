// What each version asks: one version for each of the teacher's 14 articles,
// and everything in it comes from the articles — the two texts to read aloud
// (passages of the article), the two pictures (photos from the article), the
// interview, the graph of Questions 8–10 (the article's figures and facts) and
// the topic of Question 11 (the article's debate). Every student gets a
// different one.
//
//   read       Questions 1 and 2: two passages to read aloud
//   pictures   Questions 3 and 4: two photos (img/vNN.jpg, img/vNNb.jpg) and their
//              credits. When an article has only one photo that works, the second
//              comes from an article on a similar subject: `from` is its number.
//   interview  Questions 5–7: the context of a telephone interview and 3 questions
//   info       Questions 8–10: the graph (a table, or bars with notes), the caller
//              and 3 questions — the questions are only heard, never shown
//   opinion    Question 11: the topic

const table = (title, rows, source) => ({ kind: 'table', title, rows, source });
const bars = (title, unit, series, rows, notes, source) => ({ kind: 'bars', title, unit, series, rows, notes, source });

export const VERSIONS = [
  {
    n: 1,
    article: { title: '‘It keeps growing’: the tent camp that stands against Spain’s housing crisis', outlet: 'The Guardian', author: 'Ashifa Kassam', date: '29 September 2026' },
    read: [
      'On Saturday, as tens of thousands of people took to the streets of Madrid to protest against the country’s deepening housing crisis, Marta García, a retired schoolteacher, was among a small group who took the protest one step further. “At first we were 10 tents,” she said. “Now, we’re more than 300 tents, and it keeps growing.”',
      '“We need stability,” said David Iglesias, 25. “People who want to have children should be able to do so, even if they are renting. People who dream of becoming musicians or barbers should have the chance to do so and not have to worry that they need to work, work, work to pay for housing.”',
    ],
    pictures: [
      { file: 'v01.jpg', alt: 'A young man standing among tents covered with blue tarps in a city square', credit: 'Photograph: Ashifa Kassam/The Guardian' },
      { file: 'v01b.jpg', alt: 'A woman raising her fist among tents and people in a busy city square', credit: 'Photograph: The Guardian' },
    ],
    interview: {
      narrator: 'Imagine that a Spanish newspaper is preparing a report about housing. You have agreed to participate in a telephone interview about where you live.',
      questions: [
        'Where do you live now, and do you rent or own your home?',
        'How easy is it for young people in your area to find a place to live? Why?',
        'Campaigners in Spain want to limit short-term rentals for tourists. Would that help people in your area? Why or why not?',
      ],
    },
    info: {
      ...table('The Puerta del Sol housing camp: the facts', [
        ['Place', 'Puerta del Sol plaza, central Madrid'],
        ['Size of the camp', '10 tents at first; now more than 300'],
        ['Rents in Spain', 'up 80% in a decade'],
        ['House prices in Spain', 'up 63% in a decade'],
        ['What campaigners want', 'a stop to evictions, and rules for short-term and room rentals'],
        ['The government’s answer', 'a royal decree on housing, promised for Tuesday'],
        ['A famous visitor', 'the film director Pedro Almodóvar, on Sunday'],
      ], 'The Guardian, 29 September 2026'),
      narrator: 'Hi, I’m writing a report about the housing protests in Spain. I heard you have a fact sheet about the camp in Madrid. Could you answer a few questions?',
      questions: [
        'Where is the camp, and how big was it when it started?',
        'I read that house prices in Spain went up more than rents. That’s right, isn’t it?',
        'What are the campaigners asking for, and what has the government promised to do?',
      ],
    },
    opinion: 'Some people believe governments should limit how much landlords can raise the rent. Do you agree or disagree?',
  },
  {
    n: 2,
    article: { title: '‘I’m screwed’: young adults forced by EU housing crisis to live with parents', outlet: 'The Guardian', author: 'Clea Skopeliti', date: '21 May 2024' },
    read: [
      'When he was growing up, Connor, a young man in Ireland, watched as, one by one, his older siblings moved out of the family home in their early 20s. By the time he reached that age, however, the picture had changed dramatically. Now, in his social circle in Dublin, where rents have doubled since 2013, it has become the norm for people to live with their parents until they are in their mid-20s.',
      '“I’ve been looking for a flat for six months now with no success,” said Laura, who works in a managerial role. “I’m looking to live on my own for a rent of €1,000. The other day I saw an ad for a €990-a-month flat with no windows.”',
    ],
    pictures: [
      { file: 'v02.jpg', alt: 'A crowd of people marching in a city street with banners and signs', credit: 'Photograph: The Guardian' },
      { file: 'v02b.jpg', alt: 'A young woman leaning on the railing of a balcony above a street', credit: 'Photograph: Guardian Community' },
    ],
    interview: {
      narrator: 'Imagine that a European research agency is doing a study about young adults and housing. You have agreed to participate in a telephone interview.',
      questions: [
        'At what age do young people in your country usually leave their parents’ home?',
        'Who do you live with now, and how do you feel about it?',
        'What are the advantages and disadvantages of living with your parents as a young adult?',
      ],
    },
    info: {
      ...bars('Working 25- to 34-year-olds living with their parents', '%', ['2017', '2022'], [
        ['Ireland', 27, 40],
        ['Spain', 35, 42],
        ['Portugal', 41, 52],
      ], [
        ['Average rent in new tenancies in Dublin', '€2,098 a month'],
        ['Holiday rentals in Ireland', 'Airbnbs outnumber long-term rentals 14 to 1'],
        ['House prices in Croatia', 'up 14% in a year (first quarter of 2023)'],
      ], 'Eurofound, as reported in The Guardian, 21 May 2024'),
      narrator: 'Hi, I’m preparing a presentation about young people and housing in Europe. I was told you have the Eurofound figures. Can I ask you a few questions?',
      questions: [
        'Which country had the highest share of young workers living with their parents in 2022, and what was the figure?',
        'I think the share in Ireland went down between 2017 and 2022. Is that right?',
        'What else do your notes say about rents and holiday rentals?',
      ],
    },
    opinion: 'Some people believe young adults should move out of their parents’ home as soon as they start working. Do you agree or disagree?',
  },
  {
    n: 3,
    article: { title: 'AI threatens democracy. But we are not powerless: here’s how to fight back', outlet: 'The Guardian', author: 'Carine Fouteau', date: '16 October 2026' },
    read: [
      'Journalists of my generation have witnessed four major digital revolutions: the internet, social media, smartphones, and now, artificial intelligence. What fundamentally changes with AI is our relationship with the truth. For big tech companies, the boundary between truth and falsehood has vanished. This makes it essential to reaffirm the role of public-interest journalism.',
      'Quality journalism is the product of expertise guided by ethical standards: persuading sources to speak, painstakingly gathering eye-witness testimonies, cross-referencing, verifying and establishing facts. This process relies on reporting or investigative work – in other words, human effort in the field.',
    ],
    pictures: [
      { file: 'v03.jpg', alt: 'A smiling young woman at a street protest holding up a hand-painted sign', credit: 'Photograph: Sarah Yenesel/EPA' },
      { file: 'v03b.jpg', alt: 'A close-up of a screen: a hand-shaped cursor clicks a glowing button that says “AI Slop”', credit: 'Photograph: The Guardian' },
    ],
    interview: {
      narrator: 'Imagine that a media research company is doing a study about how people get their news. You have agreed to participate in a telephone interview.',
      questions: [
        'Where do you usually get your news, and how often?',
        'Have you ever used an AI tool to answer a question or to summarize a story? Tell me about it.',
        'How do you check whether something you read online is true?',
      ],
    },
    info: {
      ...table('Hacking Big Tech: a public event about technology, AI and democracy', [
        ['Organised by', 'Mediapart, in partnership with The Guardian'],
        ['Place', 'Paris'],
        ['Date', 'Saturday 17 October 2026'],
        ['Watch online', 'free live stream from 1 pm (CEST) on Mediapart’s website, app and YouTube channel'],
        ['Host', 'Carine Fouteau, president and publishing director of Mediapart'],
        ['The question', 'how journalism and democracy can fight back against big tech'],
        ['Legal action', 'the New York Times has spent $20m on litigation; cases are also under way in France'],
      ], 'The Guardian, 16 October 2026'),
      narrator: 'Hi, I’m interested in the Hacking Big Tech event, but I don’t live in Paris. Could you answer a few questions?',
      questions: [
        'When and where is the event taking place?',
        'I heard that I have to pay to watch the live stream. Is that true?',
        'Who is organising the event, and what will it talk about?',
      ],
    },
    opinion: 'Some people believe AI tools will help people to be better informed. Others believe they will spread more false information. Which view do you agree with?',
  },
  {
    n: 4,
    article: { title: 'We are teaching children maths they will never use. Isn’t it better to help them speak fluently?', outlet: 'The Guardian', author: 'Simon Jenkins', date: '16 October 2026' },
    read: [
      'At last the fourth R is born. Articulation – speaking – is to join reading, writing and arithmetic in the education canon. The pundits call it oracy. The education secretary, Lucy Powell, wants a radical reform of the national curriculum in England to reduce “desktop” working in favour of verbal fluency and practical skills.',
      'Powell’s promotion of oracy means teaching young people once again to use the spoken word to their advantage. It is about conveying what one means clearly; listening, debating and handling disagreement. Speaking well means using eye contact and appropriately adjusting your tone of voice. It means politeness and tolerance.',
    ],
    pictures: [
      { file: 'v04.jpg', alt: 'Secondary school students in uniform at their desks, one of them speaking', credit: 'Photograph: The Guardian' },
      { file: 'v04b.jpg', alt: 'An older woman holding a protest sign in a crowded street, with young people in orange scarves around her', credit: 'Photograph: Angel Garcia/Bloomberg/Getty Images', from: 7 },
    ],
    interview: {
      narrator: 'Imagine that an education research group is doing a study about speaking skills. You have agreed to participate in a telephone interview about your school experience.',
      questions: [
        'How often did you speak in front of your class at school?',
        'Do you prefer to call people or to send them messages? Why?',
        'Which do you think is more useful in everyday life: advanced maths or speaking skills? Why?',
      ],
    },
    info: {
      ...table('Oracy: the “fourth R” in English schools', [
        ['The three Rs', 'reading, writing and arithmetic'],
        ['The fourth R', 'articulation – speaking, or “oracy”'],
        ['Proposed by', 'Lucy Powell, education secretary'],
        ['The plan', 'less “desktop” work, more verbal fluency and practical skills'],
        ['Words people say each day', 'down by nearly a third in two decades'],
        ['Phone calls', 'a quarter of young people never answer unless the call is pre-arranged'],
        ['An earlier idea', 'Rishi Sunak wanted maths to be compulsory until 18'],
      ], 'The Guardian, 16 October 2026'),
      narrator: 'Hi, I’m a parent, and I heard that the school curriculum in England may change. Could you help me with a few questions?',
      questions: [
        'What is the “fourth R”, and who is proposing it?',
        'I read that people today say more words each day than they did twenty years ago. Is that correct?',
        'What does the plan want students to do more of, and what do your notes say about young people and phone calls?',
      ],
    },
    opinion: 'Some people believe speaking skills are more important for students than advanced maths. Do you agree or disagree?',
  },
  {
    n: 5,
    article: { title: 'Britain is addicted to prisons. Our crumbling probation service proves they don’t work', outlet: 'The Guardian', author: 'Polly Toynbee', date: '16 October 2026' },
    read: [
      'Today it’s the probation officers, whose conference in Newcastle is launching a ballot for industrial action. Their caseloads overflowed long ago, but now thousands of prisoners released early – 2,000 this month – have been thrust upon them. The responsibility is overwhelming, with officers blamed for crimes their clients commit.',
      'Eleven hostels and seven halfway houses, places that help probation officers supervise released prisoners, have just closed for repairs and because of a lack of staff. Drug addiction and mental health problems untreated in prisons, coupled with cuts to education, training and rehabilitation, make prisoners even less prepared for release.',
    ],
    pictures: [
      { file: 'v05.jpg', alt: 'A person walking past the high brick wall of a prison under a blue sky', credit: 'Photograph: The Guardian' },
      { file: 'v05b.jpg', alt: 'A smiling man sitting cross-legged at the entrance of a small tent', credit: 'Photograph: Ashifa Kassam/The Guardian', from: 1 },
    ],
    interview: {
      narrator: 'Imagine that a British research company is doing a survey about public services. You have agreed to participate in a telephone interview.',
      questions: [
        'Which public services do you use most often?',
        'Would you like to work in a public service, such as health, education or probation? Why or why not?',
        'Should governments spend more on prisons or on helping people after they leave prison? Why?',
      ],
    },
    info: {
      ...table('The probation service in England and Wales: key figures', [
        ['Prisoners released early this month', '2,000'],
        ['Electronic tags fitted in time', 'only 55%'],
        ['Staff levels', '25–30% below target'],
        ['New officers in training', '1,300'],
        ['Hostels and halfway houses just closed', '11 hostels and 7 halfway houses'],
        ['Pay offer rejected by the union (Napo)', '5%'],
        ['Privatisation', 'split into 21 private companies; abandoned in 2021'],
      ], 'The Guardian, 16 October 2026'),
      narrator: 'Hi, I’m a student writing an essay about the probation service. I was told you have the latest figures. Could I ask you a few questions?',
      questions: [
        'How many prisoners were released early this month, and how many new officers are being trained?',
        'I understand that almost all electronic tags are fitted on time. Is that right?',
        'What happened when the service was privatised, and what did the union decide about the pay offer?',
      ],
    },
    opinion: 'Some people believe that sending people to prison is the best way to reduce crime. Do you agree or disagree?',
  },
  {
    n: 6,
    article: { title: 'The scandal of food waste – and how we can stop it', outlet: 'The Guardian', author: 'Julian Baggini', date: '8 October 2024' },
    read: [
      'In traditional societies, little to no food goes to waste. Every edible part of an animal or plant is utilised. Attitudes towards waste are very different in industrialised nations. The United Nations Environment Programme estimates that 17% of total global food production is wasted and around the same amount lost, meaning that around a third of food produced is not consumed.',
      'Appalled to discover how much food was going to waste in her country, in 2008 Selina Juul started a Facebook group called Stop Wasting Food. Within a fortnight it had gone viral, and just three months later she was approached by REMA 1000, the biggest discount chain in Denmark, who asked her to help them reduce their waste.',
    ],
    pictures: [
      { file: 'v06.jpg', alt: 'A woman with light hair standing in a supermarket aisle holding food', credit: 'Photograph: Andreas Mikkel Hansen' },
      { file: 'v06b.jpg', alt: 'A large field covered with thousands of discarded red onions', credit: 'Photograph: Rubens Alarcon/Alamy' },
    ],
    interview: {
      narrator: 'Imagine that a supermarket chain is doing research about food shopping habits. You have agreed to participate in a telephone interview.',
      questions: [
        'How often do you go food shopping, and where do you go?',
        'What kinds of food do you throw away most often at home?',
        'What could supermarkets do to reduce the amount of food that is wasted?',
      ],
    },
    info: {
      ...table('Food waste: the figures', [
        ['World food production wasted', '17% – and about the same amount lost'],
        ['Household food waste', '74 kg per person every year'],
        ['Greenhouse gas emissions from uneaten food', '8% to 10%'],
        ['Denmark', 'cut its food waste by 25% between 2010 and 2015'],
        ['Bananas thrown away in one Danish shop', '80 to 100 a day before; about 10 after'],
        ['Canteens', 'often cook 30% more food than they need'],
        ['Food produced per person', '1961: under 2,200 calories a day; 2020: nearly 3,000'],
      ], 'UN Environment Programme and other studies, as reported in The Guardian, 8 October 2024'),
      narrator: 'Hi, I’m organising a talk about food waste at my school, and I’d like to check some figures with you.',
      questions: [
        'How much of the world’s food is wasted, and how much food does each person throw away at home every year?',
        'I read that Denmark cut its food waste in half in just five years. Is that right?',
        'What happened in the Danish shop with the bananas, and what do your notes say about canteens?',
      ],
    },
    opinion: 'Some people believe supermarkets should be required by law to give away the food they cannot sell. Do you agree or disagree?',
  },
  {
    n: 7,
    article: { title: '‘I have no neighbours’: overtourism pushes residents in Spain and Portugal to the limit', outlet: 'The Guardian', author: 'Ashifa Kassam', date: '25 January 2025' },
    read: [
      'When her husband took a tumble in the couple’s sixth-floor flat last year, Maria frantically wondered who she could call for help to lift him. In another building, another era, she might have dashed next door to ask a neighbour. But it wasn’t an option in her 11-unit building in central Lisbon, where tourist flats had proliferated and turned long-term residents into a rarity.',
      '“It’s very weird. Imagine, I have no neighbours, even though I’m in the middle of a big city,” said Alex, who lives in a building in Lisbon where every single other unit is rented via platforms such as Airbnb. “It’s like I live in a ghost place. There’s plenty of people, I just don’t know anybody.”',
    ],
    pictures: [
      { file: 'v07.jpg', alt: 'Tourists pulling suitcases through a narrow street in an old city centre', credit: 'Photograph: Paco Freire/SOPA Images/LightRocket/Getty Images' },
      { file: 'v07b.jpg', alt: 'A yellow tram going up a steep, narrow street between old buildings', credit: 'Photograph: Ian Leyland/Guardian Community' },
    ],
    interview: {
      narrator: 'Imagine that a tourism board is doing research about travel. You have agreed to participate in a telephone interview.',
      questions: [
        'When did you last stay in a hotel or a holiday flat, and where?',
        'Do many tourists visit your town or city? How do local people feel about them?',
        'Should cities limit the number of tourist flats in residential buildings? Why or why not?',
      ],
    },
    info: {
      ...table('Living among tourist flats: from the reporter’s notes', [
        ['Maria, 71 (central Lisbon)', 'an 11-unit building; tourists in all but three of the flats'],
        ['Alex (Lisbon)', 'every other flat in the building is rented on platforms such as Airbnb'],
        ['Joao Povoa, 43 (Lisbon)', 'a five-unit building; tourist flats above and below; neighbours began leaving about 10 years ago'],
        ['A building with 120 flats', 'the owner got permission to turn them all into tourist flats; the tenants are fighting it in court'],
        ['Lisbon residents', 'more than 6,600 signed a call for a referendum to ban tourist flats in residential blocks'],
      ], 'The Guardian, 25 January 2025'),
      narrator: 'Hi, I’m preparing a radio story about tourist flats, and I’d like to check some details from your notes.',
      questions: [
        'How many people signed the call for a referendum in Lisbon, and what do they want to ban?',
        'I heard that Joao Povoa lives in a big building with lots of neighbours. Is that right?',
        'What is happening in the building with 120 flats?',
      ],
    },
    opinion: 'Some people believe cities should ban tourist flats in residential buildings. Do you agree or disagree?',
  },
  {
    n: 8,
    article: { title: '‘The way universities are run is making us ill’: inside the student mental health crisis', outlet: 'The Guardian', author: 'Samira Shackle', date: '27 September 2019' },
    read: [
      'When he started working at Brunel University London 19 years ago, Terry Vass, who is now head of security, recalls that most of his work involved breaking up drunken fights outside the bars and nightclub on campus. Over the two decades he has been in the job, he has noticed a shift. Now, an increasing number of calls are for mental health incidents.',
      'British universities are experiencing a surge in student anxiety, mental breakdowns and depression. The worst times are at the start of term, when students are adjusting to being away from home, or over the holidays, when the small number who remain on campus may feel lonely and isolated.',
    ],
    pictures: [
      { file: 'v08.jpg', alt: 'An illustration of a blue head in profile with a tall pile of books on top, on a red background', credit: 'Illustration: Chris Clarke/Guardian Design' },
      { file: 'v08b.jpg', alt: 'A light-coloured dog in a “Pets As Therapy” vest lying on a checked blanket', credit: 'Photograph: Alamy', small: true },
    ],
    interview: {
      narrator: 'Imagine that a university is doing research about student life. You have agreed to participate in a telephone interview.',
      questions: [
        'How many hours a week do you usually study?',
        'What do you do to relax when you feel stressed about your studies?',
        'What should universities do to support students who feel anxious or lonely?',
      ],
    },
    info: {
      ...bars('University tuition fees in England (per year)', '£', ['Fees'], [
        ['1998', 1000],
        ['2006', 3000],
        ['2012', 9000],
        ['2017', 9250],
      ], [
        ['Average debt when students leave', 'about £50,000'],
        ['First-year students who dropped out (2015 intake)', '26,000'],
        ['Young people going to university', 'about half of 18-year-olds'],
        ['Young people with psychological problems', 'six times more than in 1995'],
      ], 'The Guardian, 27 September 2019'),
      narrator: 'Hi, I’m thinking about studying at a university in England, and I have a few questions about the costs.',
      questions: [
        'How much were tuition fees when they were introduced, and in what year?',
        'I read that fees went up to nine thousand pounds in 2006. Is that right?',
        'How much debt do students usually have when they finish, and what do the other figures show?',
      ],
    },
    opinion: 'Some people believe universities are responsible for their students’ mental health. Do you agree or disagree?',
  },
  {
    n: 9,
    article: { title: 'Japan’s September surge in student suicides: What are the key drivers?', outlet: 'The Japan Times', author: 'Mai Yoshikawa', date: '23 September 2026' },
    read: [
      'Even as Japan’s youth population shrinks, indicators of distress — including school absenteeism, reported bullying and classroom violence — have reached historic highs. While Japan excels in physical health — with UNICEF ranking the nation first among wealthy countries — it ranks 32nd out of 36 when it comes to mental well-being.',
      '“With the major environmental shift of returning to school, interpersonal issues like bullying can resurface, while academic burdens and anxiety over future paths often intensify,” says Takashi Nagasawa, chief of child and adolescent psychiatry at Tokyo Metropolitan Children’s Medical Center. He urges adults to remain vigilant during these periods.',
    ],
    pictures: [
      { file: 'v09.jpg', alt: 'A man speaking at a lectern in a conference hall, with a large screen behind him', credit: 'Photograph: courtesy of Takashi Nagasawa' },
      { file: 'v09b.jpg', alt: 'A young person in a green hooded sweatshirt standing beside stone columns', credit: 'Photograph: Adrian Sherratt/The Guardian', from: 8, small: true },
    ],
    interview: {
      narrator: 'Imagine that a school in your area is doing research about student well-being. You have agreed to participate in a telephone interview.',
      questions: [
        'How did you usually feel at the start of a new school year?',
        'Who would you talk to if you were worried about school?',
        'What can schools do to help students who feel a lot of pressure?',
      ],
    },
    info: {
      ...table('Young people’s well-being in Japan', [
        ['UNICEF ranking: physical health', '1st among wealthy countries'],
        ['UNICEF ranking: mental well-being', '32nd out of 36'],
        ['When pressure rises', 'the weeks around the new school term, from mid-August'],
        ['Earliest in', 'Hokkaido and Tohoku, where the school term starts earlier'],
        ['Main pressures', 'bullying, schoolwork and worries about the future'],
        ['Prevention month', 'September, in Tokyo and other local governments'],
        ['Free, anonymous help', 'TELL Lifeline: 0800-300-8355'],
      ], 'The Japan Times, 23 September 2026'),
      narrator: 'Hi, I’m a teacher preparing a workshop about student well-being, and I’d like to ask you about your notes on Japan.',
      questions: [
        'How does Japan rank for physical health and for mental well-being?',
        'I heard that the most difficult time for students is the end of the school year. Is that right?',
        'What pressures do students face when they go back to school, and where can they find free help?',
      ],
    },
    opinion: 'Some people believe schools should give as much attention to students’ mental health as to their grades. Do you agree or disagree?',
  },
  {
    n: 10,
    article: { title: 'School phone bans alone do not improve grades or wellbeing, says UK study', outlet: 'The Guardian', author: 'Matthew Weaver', date: '5 February 2025' },
    read: [
      'Banning smartphones at school does not by itself improve academic grades and children’s wellbeing, a study suggests. Researchers from the University of Birmingham did find that spending longer on phones and social media in general was linked to lower grades, poor sleep, disruptive behaviour and a lack of exercise. But these outcomes did not differ between schools that banned phones and those that did not.',
      'Dr Victoria Goodyear, the study’s lead author, told the BBC that school phone bans were not an effective way to tackle the negative impacts of overusing phones. She said: “What we’re suggesting is that those bans in isolation are not enough to tackle the negative impact. We need to do more than just ban phones in schools.”',
    ],
    pictures: [
      { file: 'v10.jpg', alt: 'A student in a school uniform holding a smartphone over an open exercise book', credit: 'Photograph: The Guardian' },
      { file: 'v10b.jpg', alt: 'An illustration of a man holding several old telephone receivers, surrounded by coloured dots', credit: 'Illustration: The Guardian', from: 12 },
    ],
    interview: {
      narrator: 'Imagine that a technology company is doing research about smartphone use. You have agreed to participate in a telephone interview.',
      questions: [
        'How many hours a day do you use your phone?',
        'What do you use your phone for most?',
        'Should phones be banned in schools? Why or why not?',
      ],
    },
    info: {
      ...table('The University of Birmingham phone study', [
        ['Published in', 'The Lancet Regional Health – Europe'],
        ['Students compared', '1,227'],
        ['Secondary schools', '30'],
        ['Main finding', 'phone bans alone did not improve grades or wellbeing'],
        ['More time on phones was linked to', 'lower grades, poor sleep, disruptive behaviour and less exercise'],
        ['Lead author', 'Dr Victoria Goodyear'],
        ['Recommendation', 'a wider, “holistic” approach to phone use, in and out of school'],
      ], 'The Guardian, 5 February 2025'),
      narrator: 'Hi, I’m the head of a secondary school, and we’re thinking about banning phones. I heard you’ve read the Birmingham study.',
      questions: [
        'How many students and schools did the study compare?',
        'So the study shows that banning phones improves students’ grades, right?',
        'What problems are linked to spending more time on phones, and what do the researchers recommend?',
      ],
    },
    opinion: 'Some people believe phones should be banned in all schools. Do you agree or disagree?',
  },
  {
    n: 11,
    article: { title: 'Do you remember your first crappy job? Today’s young people would wish for half your luck', outlet: 'The Guardian', author: 'Gaby Hinsliff', date: '20 February 2026' },
    read: [
      'When Keir Starmer was 14 years old, he got a part-time job clearing stones from a local farmer’s field. At 16, Kemi Badenoch was flipping burgers and cleaning toilets in McDonald’s. Me, I waitressed at weekends from the age of 15 in an Essex pub.',
      'School leavers are now competing for work stacking shelves or pulling pints with overqualified new graduates who can’t find graduate jobs, at a time when pubs, shops and cafes don’t seem to be hiring. Even those employers strong enough to have survived lockdown routinely complain that it’s getting too expensive to hire staff – especially young ones.',
    ],
    pictures: [
      { file: 'v11.jpg', alt: 'An illustration of two young workers: a waiter carrying a tray and a lifeguard holding a life ring', credit: 'Illustration: The Guardian' },
      { file: 'v11b.jpg', alt: 'People sitting and working in a colourful office with round seats and tree trunks', credit: 'Photograph: Google', from: 12 },
    ],
    interview: {
      narrator: 'Imagine that an employment agency is doing research about young people and work. You have agreed to participate in a telephone interview.',
      questions: [
        'What was your first job, or what job would you like to have first?',
        'How do young people in your area usually find part-time work?',
        'What can young people learn from a part-time job?',
      ],
    },
    info: {
      ...bars('The minimum wage in the UK (per hour)', '£', ['Per hour'], [
        ['Workers under 20', 10],
        ['Adults', 12.21],
      ], [
        ['Extra cost of hiring an 18- to 20-year-old this spring, compared with 2024', '26% more'],
        ['Unemployment among 18- to 24-year-olds', 'the highest since 2015, outside the pandemic'],
        ['Living with their parents', 'almost three-quarters of 19-year-olds; 61% of 20-year-olds'],
        ['The minimum wage', 'introduced almost 27 years ago'],
      ], 'Centre for Policy Studies and others, as reported in The Guardian, 20 February 2026'),
      narrator: 'Hi, I run a small café, and I’m thinking about hiring a young person. Can I ask you about the figures you have?',
      questions: [
        'What is the minimum wage for workers under 20, and what is the adult rate?',
        'I heard that hiring young people is getting cheaper this year. Is that right?',
        'What do your figures say about young people’s unemployment and about living with their parents?',
      ],
    },
    opinion: 'Some people believe teenagers should have a part-time job while they are still at school. Do you agree or disagree?',
  },
  {
    n: 12,
    article: { title: 'Burnt out: is the exhausting cult of productivity finally over?', outlet: 'The Guardian', author: 'Zoe Williams', date: '22 April 2021' },
    read: [
      'In the US, they call it “hustle culture”: the idea that the ideal person for the modern age is one who is always on, always at work, always grafting. Your work is your life, and when you are not doing your hustle, you have a side hustle. Like all the world’s worst ideas, it started in Silicon Valley.',
      'The tech companies’ attitudes have migrated into other “status” sectors, together with the workplaces that look like a kind of grownup soft-play, all colourful sofas and ping-pong and hot meals. In finance, food has become such a sign of pastoral care that Goldman Sachs recently sent junior employees hampers to make up for their 100-hour working weeks.',
    ],
    pictures: [
      { file: 'v12.jpg', alt: 'A tired man in an office holding his head, next to tall piles of paper and a telephone', credit: 'Photograph: Bob Scott/Getty Images' },
      { file: 'v12b.jpg', alt: 'A man standing with his black dog in a small square with colourful graffiti on the walls', credit: 'Photograph: The Guardian', from: 7 },
    ],
    interview: {
      narrator: 'Imagine that a human resources company is doing research about working life. You have agreed to participate in a telephone interview.',
      questions: [
        'How many hours a week do you usually work or study?',
        'What do you like to do when you are not working or studying?',
        'Do you think people today work too much? Why or why not?',
      ],
    },
    info: {
      ...bars('Working weeks mentioned in the article (hours)', 'h', ['Hours a week'], [
        ['Junior employees at Goldman Sachs', 100],
        ['“People of vision”, according to Elon Musk', { v: 80, text: '80 hours or more' }],
        ['Sam Baker, magazine editor, for most of her life', 80],
        ['The week Musk says never changed the world', 40],
      ], [
        ['Volunteers during the pandemic', 'more than 12 million people'],
        ['Charlotte White, 47', 'left 20 years in advertising to volunteer at a food bank'],
        ['Neal, 50, an accountant who lost his job', 'about one interview for every 25 applications'],
        ['Jennifer, 39, an academic', 'cut her hours on furlough without losing pay'],
      ], 'The Guardian, 22 April 2021'),
      narrator: 'Hi, I’m writing a blog post about working hours, and I’d like to check some numbers with you.',
      questions: [
        'How many hours a week do junior employees at Goldman Sachs work?',
        'I read that Elon Musk thinks forty hours a week is enough to change the world. Is that right?',
        'How did some of the people in the article change their working lives during the pandemic?',
      ],
    },
    opinion: 'Some people believe working long hours is necessary to be successful. Do you agree or disagree?',
  },
  {
    n: 13,
    article: { title: '‘Where do they expect us to go?’ Life at one Bay Area encampment before eviction', outlet: 'The Guardian', author: 'Maanvi Singh', date: '5 May 2022' },
    read: [
      'Sarah and her partner, Kevin, both 55, have lived in the scattered encampments along this stretch of busy highway in Berkeley, California, for years now. They’ve had to pack up several times, moving from one camp to the next as authorities cleared plot after plot. Last month, a federal judge ruled officials could remove the last remaining tents by 4 May.',
      'In many ways, the plight of this encampment is the story of homelessness in California. Its residents have been evicted several times over the past years, disassembling and reassembling their lives each time. Many have spent years on waitlists for subsidized apartments but are nowhere near to landing a stable home.',
    ],
    pictures: [
      { file: 'v13.jpg', alt: 'A woman sitting among her belongings at a camp beside a highway', credit: 'Photograph: Preston Gannaway/The Guardian' },
      { file: 'v13b.jpg', alt: 'Tents and piles of belongings under large trees at a camp', credit: 'Photograph: Preston Gannaway/The Guardian' },
    ],
    interview: {
      narrator: 'Imagine that a city council is doing research about housing and public services. You have agreed to participate in a telephone interview.',
      questions: [
        'Are there enough homes that people can afford in your city?',
        'Which organizations in your area help people who have lost their homes?',
        'What should cities do to help people who live on the streets?',
      ],
    },
    info: {
      ...table('Unhoused in California: the figures', [
        ['Unhoused people in California', 'about 161,000'],
        ['People who once lived in the I-80 camps in Berkeley', 'more than 150; about a dozen remain'],
        ['Unsheltered people in the US with physical health issues', '84%'],
        ['Unsheltered people in the US with mental health issues', '78%'],
        ['Cost of a place in a shelter', 'about $100 a night, or $3,000 a month'],
        ['Caltrans budget, 2021–22', '$25m to clean up camps; $20.6m to remove hazardous materials; $2.7m to help people relocate'],
        ['Deadline set by a federal judge', '4 May'],
      ], 'The Guardian, 5 May 2022'),
      narrator: 'Hi, I volunteer with a group that helps unhoused people, and I’m preparing a presentation. Could you help me with some figures?',
      questions: [
        'How many unhoused people are there in California, and how many people once lived in the camps by the I-80?',
        'I heard that a place in a shelter costs about thirty dollars a night. Is that right?',
        'How did the state transport agency plan to spend its money on the camps?',
      ],
    },
    opinion: 'Some people believe cities should provide free housing for people who live on the streets. Do you agree or disagree?',
  },
  {
    n: 14,
    article: { title: 'How do we know that the climate crisis is to blame for extreme weather?', outlet: 'The Guardian', author: 'Damian Carrington', date: '18 November 2024' },
    read: [
      'It is a crucial question: is the climate crisis to blame for the extreme weather disasters taking lives and destroying homes around the world? But it has not been an easy one to answer. How much is due to global heating, how much is just the severe weather that has always happened?',
      'The good news is that the scientific techniques used to untangle that question – called climate attribution – are now well established. The bad news is what they reveal: heatwaves, floods and storms are now hitting communities with a severity and frequency never seen during the entire development of human civilisation.',
    ],
    pictures: [
      { file: 'v14.jpg', alt: 'A fire truck on dry land in front of a wide line of flames and smoke', credit: 'Photograph: Thomas Cudy' },
      { file: 'v14b.jpg', alt: 'A river in flood rushing past a town with a tall church tower', credit: 'Photograph: The Guardian' },
    ],
    interview: {
      narrator: 'Imagine that an environmental organization is doing research about the weather in different countries. You have agreed to participate in a telephone interview.',
      questions: [
        'What is the weather usually like where you live at this time of year?',
        'Have you noticed any changes in the weather in recent years? Tell me about them.',
        'What can ordinary people do to help reduce climate change?',
      ],
    },
    info: {
      ...bars('Extreme weather made worse or more likely by global heating (share of studies)', '%', ['Share of studies'], [
        ['Heatwaves (more than 200 studies)', 95],
        ['Damage and deaths (33 studies)', 91],
        ['Droughts (106 events)', { v: 70, text: 'almost 70%' }],
        ['Rain and floods (177 studies)', { v: 60, text: 'more than 60%' }],
      ], [
        ['All studies in the Carbon Brief database', '744 – three-quarters found a significant impact'],
        ['“Impossible” heatwaves', 'at least 24 so far'],
        ['Hurricane Harvey, 2017', '30–50% of the flooded US properties would not have flooded without global heating'],
      ], 'Carbon Brief, as reported in The Guardian, 18 November 2024'),
      narrator: 'Hi, I’m a science teacher preparing a lesson about extreme weather. Can I check some numbers with you?',
      questions: [
        'How many attribution studies are in the Carbon Brief database, and how many of them found a significant impact?',
        'I read that only about half of the heatwave studies found that global heating made them worse. Is that right?',
        'What did the studies find about droughts and floods?',
      ],
    },
    opinion: 'Some people believe individuals can do a lot to stop climate change. Others believe only governments and companies can make a difference. Which view do you agree with?',
  },
];

export const versionOf = (n) => VERSIONS.find((v) => v.n === Number(n)) || null;

// A version by chance: only without the teacher's script (a local test of the
// page) or in the teacher's demo. Students get theirs from the script, and no
// two students get the same one.
export function pickVersion(asked, random = Math.random) {
  const fixed = versionOf(asked);
  if (fixed) return fixed.n;
  return VERSIONS[Math.min(VERSIONS.length - 1, Math.floor(random() * VERSIONS.length))].n;
}

// A bar's value and how it is written: 27 → "27%", { v: 70, text: 'almost 70%' } → "almost 70%".
export function barValue(x, unit) {
  if (x && typeof x === 'object') return { v: x.v, text: x.text };
  const n = Number(x);
  const money = `£${n.toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;
  const text = unit === '%' ? `${n}%` : unit === '£' ? money : unit === 'h' ? `${n} hours` : String(n);
  return { v: n, text };
}

// The graph as one line of text (the teacher's sheet keeps it).
export function infoText(info) {
  const lines = [info.title];
  if (info.kind === 'table') lines.push(...info.rows.map(([k, v]) => `${k}: ${v}`));
  else {
    const value = (x, i) => `${info.series.length > 1 ? `${info.series[i]} ` : ''}${barValue(x, info.unit).text}`;
    lines.push(...info.rows.map(([label, ...vals]) => `${label}: ${vals.map(value).join(', ')}`));
    lines.push(...info.notes.map(([k, v]) => `${k}: ${v}`));
  }
  lines.push(`Source: ${info.source}`);
  return lines.join(' · ');
}
