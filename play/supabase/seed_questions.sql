-- ============================================
-- COMPOTARO /PLAY — Question Bank
-- seed_questions.sql
-- 220 questions across 10 categories
-- ============================================

-- ─── FILM (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Film', 'Who originally played Marty McFly in Back to the Future before being replaced by Michael J. Fox?',
 '["Eric Stoltz","John Cusack","Charlie Sheen","Rob Lowe"]', 0, 'medium'),

('Film', 'Which film won the very first Academy Award for Best Picture at the inaugural ceremony in 1929?',
 '["Wings","Sunrise","The Jazz Singer","It"]', 0, 'hard'),

('Film', 'What is hidden in Hollywood producer Jack Woltz''s bed as a warning in The Godfather?',
 '["A horse''s head","A severed hand","Dead fish","A loaded revolver"]', 0, 'easy'),

('Film', 'Which 1999 film features the twist "I see dead people"?',
 '["The Sixth Sense","Fight Club","American Beauty","The Blair Witch Project"]', 0, 'easy'),

('Film', 'What fictional hotel is the primary setting of Stanley Kubrick''s The Shining?',
 '["The Overlook Hotel","The Bates Motel","The Grand Budapest Hotel","The Dolphin Hotel"]', 0, 'easy'),

('Film', 'Which film was the first to gross over $100 million at the U.S. domestic box office?',
 '["Jaws (1975)","Star Wars (1977)","The Godfather (1972)","Rocky (1976)"]', 0, 'medium'),

('Film', 'What is the name of the doomed commercial spacecraft in Alien (1979)?',
 '["USCSS Nostromo","Sulaco","Prometheus","Covenant"]', 0, 'medium'),

('Film', 'Which was the first South Korean film to win the Academy Award for Best Picture?',
 '["Parasite","Oldboy","Train to Busan","The Handmaiden"]', 0, 'easy'),

('Film', 'Which classic Humphrey Bogart film features the line "Here''s looking at you, kid"?',
 '["Casablanca","The Maltese Falcon","Key Largo","Dark Passage"]', 0, 'easy'),

('Film', 'What was Pixar''s very first feature-length film?',
 '["Toy Story (1995)","A Bug''s Life","Monsters, Inc.","Finding Nemo"]', 0, 'easy'),

('Film', 'Which Quentin Tarantino film won the Palme d''Or at the Cannes Film Festival in 1994?',
 '["Pulp Fiction","Reservoir Dogs","Jackie Brown","Kill Bill"]', 0, 'medium'),

('Film', 'Who played the Joker opposite Michael Keaton''s Batman in Tim Burton''s 1989 film?',
 '["Jack Nicholson","Heath Ledger","Cesar Romero","Joaquin Phoenix"]', 0, 'easy'),

('Film', 'Which Christopher Nolan film tells its story entirely in reverse chronological order?',
 '["Memento","Inception","The Prestige","Following"]', 0, 'medium'),

('Film', 'The Silence of the Lambs (1991) was only the second film in history to win the "Big Five" Oscars. What was the first?',
 '["It Happened One Night (1934)","One Flew Over the Cuckoo''s Nest","Network","Kramer vs. Kramer"]', 0, 'hard'),

('Film', 'In Pulp Fiction, what does Winston Wolfe specialize in?',
 '["Cleaning up crime scenes","Contract killing","Money laundering","Drug distribution"]', 0, 'medium'),

('Film', 'Which film features the line "Life is like a box of chocolates — you never know what you''re gonna get"?',
 '["Forrest Gump","Cast Away","Philadelphia","You''ve Got Mail"]', 0, 'easy'),

('Film', 'What does Rose drop into the ocean at the end of Titanic (1997)?',
 '["The Heart of the Ocean necklace","Jack''s locket","Her engagement ring","A pocket watch"]', 0, 'medium'),

('Film', 'Which actor turned down the role of Indiana Jones before Harrison Ford was cast?',
 '["Tom Selleck","Jeff Bridges","Nick Nolte","Steve Martin"]', 0, 'medium'),

('Film', 'In how many categories did Titanic (1997) win at the Academy Awards, tying the all-time record?',
 '["11","9","12","14"]', 0, 'hard'),

('Film', 'What is the name of the fictional country in Black Panther?',
 '["Wakanda","Genosha","Latveria","Markovia"]', 0, 'easy'),

('Film', 'Which 1999 David Fincher film''s final twist revealed that Tyler Durden was imaginary?',
 '["Fight Club","Se7en","The Game","Panic Room"]', 0, 'easy'),

('Film', 'In The Wizard of Oz, what does Dorothy repeat while clicking her ruby slippers?',
 '["There''s no place like home","I want to go home","Home, sweet home","Take me back to Kansas"]', 0, 'easy');

-- ─── TV (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('TV', 'What show features the fictional Dunder Mifflin Paper Company?',
 '["The Office","Parks and Recreation","30 Rock","Arrested Development"]', 0, 'easy'),

('TV', 'Which HBO drama series is set in the fictional continent of Westeros?',
 '["Game of Thrones","Rome","Deadwood","Boardwalk Empire"]', 0, 'easy'),

('TV', 'Who played chemistry-teacher-turned-drug-lord Walter White in Breaking Bad?',
 '["Bryan Cranston","Aaron Paul","Bob Odenkirk","Dean Norris"]', 0, 'easy'),

('TV', 'In Friends, what fictional soap opera does Joey Tribbiani star in?',
 '["Days of Our Lives","General Hospital","The Young and the Restless","As the World Turns"]', 0, 'medium'),

('TV', 'Which character delivers the line "I am the one who knocks" in Breaking Bad?',
 '["Walter White","Jesse Pinkman","Hank Schrader","Gustavo Fring"]', 0, 'easy'),

('TV', 'What is Tony Soprano''s legitimate cover business in The Sopranos?',
 '["Waste management","Construction","Auto repair","Paving"]', 0, 'easy'),

('TV', 'Which British sitcom features the catchphrase "Don''t mention the war" from the character Basil Fawlty?',
 '["Fawlty Towers","Blackadder","Only Fools and Horses","Dad''s Army"]', 0, 'medium'),

('TV', 'What numbers are broadcast on a loop from the hatch in Lost?',
 '["4, 8, 15, 16, 23, 42","1, 4, 8, 16, 23, 48","4, 8, 15, 23, 42, 108","2, 4, 8, 16, 32, 64"]', 0, 'hard'),

('TV', 'Which show famously "jumped the shark" when Fonzie literally jumped over a shark on water skis?',
 '["Happy Days","Laverne & Shirley","Three''s Company","M*A*S*H"]', 0, 'medium'),

('TV', 'What is Homer Simpson''s fictional beer of choice?',
 '["Duff","Buzz","Pabst","Krusty Brand"]', 0, 'easy'),

('TV', 'Which Netflix series is set at a women''s prison and based on Piper Kerman''s memoir?',
 '["Orange Is the New Black","Wentworth","Vis a Vis","The Fall"]', 0, 'easy'),

('TV', 'Who plays Tyrion Lannister in Game of Thrones?',
 '["Peter Dinklage","Nikolaj Coster-Waldau","Kit Harington","Lena Headey"]', 0, 'easy'),

('TV', 'In which fictional small town is the series Stranger Things set?',
 '["Hawkins, Indiana","Springfield, Illinois","Twin Peaks, Washington","Castle Rock, Maine"]', 0, 'easy'),

('TV', 'What award-winning AMC drama series is set on Madison Avenue in the 1960s advertising world?',
 '["Mad Men","Masters of Sex","Pan Am","Halt and Catch Fire"]', 0, 'easy'),

('TV', 'Who plays a young Queen Elizabeth II in the first two seasons of The Crown?',
 '["Claire Foy","Olivia Colman","Imelda Staunton","Vanessa Kirby"]', 0, 'medium'),

('TV', 'What song plays over the opening credits of The Sopranos?',
 '["Woke Up This Morning by Alabama 3","Born to Run by Bruce Springsteen","Thunder Road by Bruce Springsteen","Livin'' on a Prayer by Bon Jovi"]', 0, 'medium'),

('TV', 'In which show does Saul Goodman appear as a character before getting his own spin-off?',
 '["Breaking Bad","The Wire","Ozark","Narcos"]', 0, 'easy'),

('TV', 'What fictional TV show does Seinfeld''s George Costanza pitch to NBC executives in an episode called "The Pitch"?',
 '["A show about nothing","A cooking competition","A sports show","A travel show"]', 0, 'medium'),

('TV', 'Which acclaimed HBO show is set in Baltimore and follows drug dealers, law enforcement, and politicians?',
 '["The Wire","Homicide: Life on the Street","The Shield","Treme"]', 0, 'easy'),

('TV', 'What is the name of the diner in Twin Peaks where Agent Cooper loves the coffee and cherry pie?',
 '["The Double R Diner","The Silver Bullet","Norma''s Place","The Great Northern Café"]', 0, 'hard'),

('TV', 'In The Simpsons, what is the name of Springfield''s nuclear power plant?',
 '["Springfield Nuclear Power Plant","Sector 7G","Burns Industries","Springfield Energy"]', 0, 'medium'),

('TV', 'Which streaming show is based on the true story of the NXIVM cult, led by Keith Raniere?',
 '["The Vow","Escaping Twin Flames","Wild Wild Country","Holy Hell"]', 0, 'medium');

-- ─── COMEDY (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Comedy', 'Which 1980 comedy film features the line "Don''t call me Shirley"?',
 '["Airplane!","Caddyshack","Animal House","Blazing Saddles"]', 0, 'easy'),

('Comedy', 'What is the name of Bill Murray''s weatherman character in Groundhog Day?',
 '["Phil Connors","Bob Harris","Larry Darrell","Victor Maitland"]', 0, 'medium'),

('Comedy', 'Which comedy film stars Jim Carrey as a lawyer magically unable to lie for 24 hours?',
 '["Liar Liar","The Mask","Ace Ventura","Yes Man"]', 0, 'easy'),

('Comedy', 'In Monty Python and the Holy Grail, what do the knights say those who say "Ni" demand?',
 '["A shrubbery","A herring","A fair maiden","An apple"]', 0, 'medium'),

('Comedy', 'What scheme do the main characters attempt in Office Space using a computer virus?',
 '["Embezzle fractions of cents into a bank account","Crash the company''s server","Steal company software","Delete employee records"]', 0, 'medium'),

('Comedy', 'Who plays the two man-child step-brothers Brennan and Dale in Step Brothers?',
 '["Will Ferrell and John C. Reilly","Vince Vaughn and Owen Wilson","Seth Rogen and James Franco","Paul Rudd and Jason Segel"]', 0, 'easy'),

('Comedy', 'In Superbad, what fake name appears on Fogell''s fake ID?',
 '["McLovin","Fogell Smith","Dave Henderson","Mark Falkner"]', 0, 'easy'),

('Comedy', 'Which Sacha Baron Cohen character is described as "Kazakhstan''s sixth most famous man"?',
 '["Borat Sagdiyev","Bruno","Ali G","The Dictator"]', 0, 'medium'),

('Comedy', 'In Dumb and Dumber, what is the destination that Lloyd and Harry are driving to?',
 '["Aspen, Colorado","Las Vegas, Nevada","Miami, Florida","New York City"]', 0, 'medium'),

('Comedy', 'Who voices the ogre Shrek in the animated comedy franchise?',
 '["Mike Myers","Eddie Murphy","Antonio Banderas","John Lithgow"]', 0, 'easy'),

('Comedy', 'What is found in the hotel room the morning after the Wolfpack''s blackout night in The Hangover?',
 '["A live tiger","A baby alone","A rooster","A burning mattress"]', 0, 'easy'),

('Comedy', 'Which actress starred in and co-wrote the 2011 comedy Bridesmaids?',
 '["Kristen Wiig","Maya Rudolph","Rose Byrne","Melissa McCarthy"]', 0, 'easy'),

('Comedy', 'Who plays the title character nanny disguised as a woman in Mrs. Doubtfire?',
 '["Robin Williams","Dustin Hoffman","Tom Hanks","Steve Martin"]', 0, 'easy'),

('Comedy', 'In Clueless (1995), what is Cher Horowitz''s signature dismissive phrase?',
 '["As if!","Whatever!","Totally!","Duh!"]', 0, 'medium'),

('Comedy', 'Which Leslie Nielsen film series parodies police procedurals and action movies?',
 '["The Naked Gun","Police Academy","Hot Shots!","Spy Hard"]', 0, 'easy'),

('Comedy', 'In Four Weddings and a Funeral, what national holiday do Hugh Grant and Andie MacDowell first meet at?',
 '["A wedding","A funeral","A christening","A New Year''s party"]', 0, 'easy'),

('Comedy', 'What Larry David-created show followed Seinfeld as his next project?',
 '["Curb Your Enthusiasm","Entourage","The Larry Sanders Show","Extras"]', 0, 'easy'),

('Comedy', 'Which Mel Brooks comedy parodies westerns with the line "Mongo only pawn in game of life"?',
 '["Blazing Saddles","Young Frankenstein","High Anxiety","Spaceballs"]', 0, 'medium'),

('Comedy', 'In Ferris Bueller''s Day Off, who plays the uptight principal trying to catch Ferris skipping school?',
 '["Jeffrey Jones","Ben Stein","Jennifer Grey","Mia Sara"]', 0, 'hard'),

('Comedy', 'Which comedy film features Chevy Chase as the bumbling patriarch of the Griswold family?',
 '["National Lampoon''s Vacation","Fletch","Three Amigos","The Funny Farm"]', 0, 'easy'),

('Comedy', 'In This Is Spinal Tap, what is special about the band''s amplifier that goes to 11?',
 '["Nothing — it''s the same volume; the joke is they don''t know","It has hidden distortion","It has a special tube","It runs at higher wattage"]', 0, 'hard'),

('Comedy', 'Who directed the 1980 comedy classic Airplane!, which spawned a whole genre of spoof films?',
 '["Jim Abrahams and David Zucker","Mel Brooks","John Landis","Ivan Reitman"]', 0, 'hard');

-- ─── DRAMA (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Drama', 'In which Paul Thomas Anderson film does Daniel Day-Lewis deliver the line "I drink your milkshake!"?',
 '["There Will Be Blood","Phantom Thread","Gangs of New York","The Last of the Mohicans"]', 0, 'medium'),

('Drama', 'Which film accidentally received the Best Picture Oscar announcement before Moonlight in a famous 2017 mix-up?',
 '["La La Land","Hacksaw Ridge","Manchester by the Sea","Hell or High Water"]', 0, 'medium'),

('Drama', 'In A Beautiful Mind (2001), which real-life mathematician is played by Russell Crowe?',
 '["John Nash","Alan Turing","Kurt Gödel","Claude Shannon"]', 0, 'easy'),

('Drama', 'Which thriller-drama stars Rosamund Pike as a woman who fakes her own disappearance?',
 '["Gone Girl","The Girl on the Train","Sharp Objects","Big Little Lies"]', 0, 'easy'),

('Drama', 'What is the name of the prison in The Shawshank Redemption?',
 '["Shawshank State Penitentiary","Green Mile Correctional","Cold Mountain Prison","Alcatraz"]', 0, 'easy'),

('Drama', 'Who played Ray Charles in the acclaimed 2004 biopic Ray?',
 '["Jamie Foxx","Forest Whitaker","Denzel Washington","Don Cheadle"]', 0, 'easy'),

('Drama', 'In which Darren Aronofsky film does Natalie Portman play a ballerina experiencing psychological breakdown?',
 '["Black Swan","Requiem for a Dream","Pi","mother!"]', 0, 'easy'),

('Drama', 'Who plays the brutal music instructor Terence Fletcher in Whiplash (2014)?',
 '["J.K. Simmons","Philip Seymour Hoffman","Edward Norton","Paul Giamatti"]', 0, 'easy'),

('Drama', 'What is the name of Robin Williams''s therapist character in Good Will Hunting?',
 '["Sean Maguire","Gerald Lambeau","Chuck Noland","John Keating"]', 0, 'medium'),

('Drama', 'Which Ang Lee film won the Academy Award for Best Director and Best Picture in 2005?',
 '["Brokeback Mountain","Crouching Tiger, Hidden Dragon","Life of Pi","The Ice Storm"]', 0, 'medium'),

('Drama', 'Who plays Queen Elizabeth II in the 2006 film The Queen?',
 '["Helen Mirren","Cate Blanchett","Judi Dench","Emma Thompson"]', 0, 'easy'),

('Drama', 'In Kramer vs. Kramer (1979), whose custody is at the center of the courtroom battle?',
 '["Son Billy Kramer","Daughter Emma Kramer","Twin boys","The film doesn''t specify"]', 0, 'medium'),

('Drama', 'Which Terrence Malick film won the Palme d''Or at Cannes in 2011?',
 '["The Tree of Life","Badlands","Days of Heaven","The Thin Red Line"]', 0, 'hard'),

('Drama', 'Who plays Truman Burbank, the man whose entire life is an unwitting TV show, in The Truman Show?',
 '["Jim Carrey","Tom Hanks","Bill Murray","Steve Martin"]', 0, 'easy'),

('Drama', 'In Capote (2005), which journalist''s research into the Clutter family murders is depicted?',
 '["Truman Capote","Gay Talese","Norman Mailer","Tom Wolfe"]', 0, 'medium'),

('Drama', 'Which 2013 film follows Solomon Northup, a free Black man kidnapped into slavery?',
 '["12 Years a Slave","Lincoln","Django Unchained","Selma"]', 0, 'easy'),

('Drama', 'What terminal illness does Hazel Grace Lancaster have in The Fault in Our Stars?',
 '["Thyroid cancer spread to the lungs","Leukemia","Cystic fibrosis","Multiple myeloma"]', 0, 'hard'),

('Drama', 'Which director made the film Amour (2012), about an elderly Parisian couple?',
 '["Michael Haneke","Luca Guadagnino","Paolo Sorrentino","Jacques Audiard"]', 0, 'hard'),

('Drama', 'In the drama Whiplash, what instrument does protagonist Andrew Neiman play?',
 '["Drums","Piano","Trumpet","Cello"]', 0, 'easy'),

('Drama', 'Who directed Schindler''s List AND Jurassic Park in the same year, 1993?',
 '["Steven Spielberg","Ron Howard","James Cameron","Ridley Scott"]', 0, 'easy'),

('Drama', 'Which biographical drama stars Joaquin Phoenix as Johnny Cash?',
 '["Walk the Line","I''m Still Here","Her","The Master"]', 0, 'easy'),

('Drama', 'What city does the trauma unfold in during Manchester by the Sea (2016)?',
 '["Manchester-by-the-Sea, Massachusetts","Manchester, England","Boston, Massachusetts","Portland, Maine"]', 0, 'medium');

-- ─── THRILLER (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Thriller', 'What was Hannibal Lecter''s profession before his imprisonment in Silence of the Lambs?',
 '["Psychiatrist","Surgeon","Professor of Art History","Chef"]', 0, 'easy'),

('Thriller', 'Which Alfred Hitchcock film features a notorious shower murder scene?',
 '["Psycho","Vertigo","Rear Window","The Birds"]', 0, 'easy'),

('Thriller', 'In Se7en, how many of John Doe''s seven deadly sins murders are actually completed by the film''s end?',
 '["All seven","Five","Six","Four"]', 0, 'hard'),

('Thriller', 'What does Kevin Spacey''s character reveal is inside the box at the end of Se7en?',
 '["Detective Mills''s wife''s severed head","Proof of John Doe''s crimes","A bomb","A mirror"]', 0, 'medium'),

('Thriller', 'In Rear Window, what injury keeps L.B. Jefferies confined to his apartment?',
 '["A broken leg","A broken arm","A back injury","A knee injury"]', 0, 'easy'),

('Thriller', 'In The Usual Suspects, who is revealed to be the mysterious Keyser Söze?',
 '["Verbal Kint (Roger Kint)","Dean Keaton","McManus","Fenster"]', 0, 'medium'),

('Thriller', 'Which Christopher Nolan film follows a man with anterograde amnesia investigating his wife''s murder?',
 '["Memento","Insomnia","Following","Batman Begins"]', 0, 'easy'),

('Thriller', 'In No Country for Old Men, what unusual weapon does Anton Chigurh use to kill his victims?',
 '["A captive bolt pistol","A silenced shotgun","Piano wire","A hunting knife"]', 0, 'medium'),

('Thriller', 'Which film stars Denzel Washington as a corrupt Los Angeles police officer in Training Day?',
 '["Training Day","The Equalizer","Man on Fire","John Q"]', 0, 'easy'),

('Thriller', 'In which thriller does a forensic accountant named Michael Clayton get entangled in a corporate cover-up?',
 '["Michael Clayton","The Firm","Erin Brockovich","The Pelican Brief"]', 0, 'medium'),

('Thriller', 'What is the famous quote from A Few Good Men delivered by Jack Nicholson''s Colonel Jessup?',
 '["You can''t handle the truth!","I did my job, counselor","A soldier doesn''t lie","You''re out of order!"]', 0, 'easy'),

('Thriller', 'In Zodiac (2007), which real-life unsolved serial killer case is the focus of the investigation?',
 '["The Zodiac Killer","The BTK Killer","Ted Bundy","The Son of Sam"]', 0, 'easy'),

('Thriller', 'What is the main character Lou Bloom''s occupation in the thriller Nightcrawler (2014)?',
 '["Freelance crime videographer","Private detective","Paparazzo","Bounty hunter"]', 0, 'medium'),

('Thriller', 'In Michael Mann''s Heat (1995), what type of crime does Robert De Niro''s crew primarily commit?',
 '["Bank robbery","Art heist","Casino robbery","Drug trafficking"]', 0, 'medium'),

('Thriller', 'Which thriller stars Jake Gyllenhaal as a detective investigating the disappearance of two young girls?',
 '["Prisoners","Zodiac","Nightcrawler","Enemy"]', 0, 'easy'),

('Thriller', 'In Knives Out (2019), who is the victim whose mysterious death kicks off the investigation?',
 '["Harlan Thrombey","Ransom Drysdale","Richard Drysdale","Walt Thrombey"]', 0, 'medium'),

('Thriller', 'Which country produced the acclaimed revenge thriller Oldboy (2003)?',
 '["South Korea","Japan","France","Hong Kong"]', 0, 'medium'),

('Thriller', 'In Uncut Gems (2019), what rare gem does Adam Sandler''s Howard Ratner stake everything on?',
 '["An Ethiopian black opal","A Kashmir sapphire","A red diamond","A Burmese ruby"]', 0, 'medium'),

('Thriller', 'What social thriller examines class warfare between a wealthy Seoul family and a poor one?',
 '["Parasite","Burning","Snowpiercer","Okja"]', 0, 'easy'),

('Thriller', 'In Rear Window, what does Jefferies suspect has happened to his neighbor Thorwald''s wife?',
 '["Thorwald murdered her","She ran off with another man","She died of illness","She was kidnapped"]', 0, 'medium'),

('Thriller', 'Which David Fincher film follows FBI agent Holden Ford profiling serial killers in the 1970s?',
 '["Mindhunter","Zodiac","Se7en","Panic Room"]', 0, 'medium'),

('Thriller', 'In Gone Girl, whose alternating perspective narrates the story alongside Nick Dunne''s chapters?',
 '["Amy Dunne (his wife)","A detective","Nick''s twin sister Margo","Nick''s lawyer"]', 0, 'medium');

-- ─── ACTORS (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Actors', 'Which actress has won the most Academy Awards for acting, with four wins?',
 '["Katharine Hepburn","Meryl Streep","Frances McDormand","Cate Blanchett"]', 0, 'medium'),

('Actors', 'Who played Captain Jack Sparrow in the Pirates of the Caribbean franchise?',
 '["Johnny Depp","Orlando Bloom","Keira Knightley","Geoffrey Rush"]', 0, 'easy'),

('Actors', 'Which actor plays both Sherlock Holmes in a BBC series and Doctor Strange in the MCU?',
 '["Benedict Cumberbatch","Robert Downey Jr.","Tom Hiddleston","Daniel Craig"]', 0, 'easy'),

('Actors', 'Which actor was originally cast as Indiana Jones but had to drop out due to a TV contract?',
 '["Tom Selleck","Jeff Bridges","Nick Nolte","Steve Martin"]', 0, 'medium'),

('Actors', 'Who plays Wolverine in the X-Men film series?',
 '["Hugh Jackman","Liev Schreiber","James McAvoy","Michael Fassbender"]', 0, 'easy'),

('Actors', 'Which actor won back-to-back Academy Awards for Best Actor for Philadelphia and Forrest Gump?',
 '["Tom Hanks","Anthony Hopkins","Jack Nicholson","Dustin Hoffman"]', 0, 'easy'),

('Actors', 'Who is the only actor to receive an Academy Award nomination for acting in a Star Wars film?',
 '["Alec Guinness","Harrison Ford","Mark Hamill","Natalie Portman"]', 0, 'hard'),

('Actors', 'Which actor played both Batman and Beetlejuice in iconic Tim Burton films?',
 '["Michael Keaton","Christian Bale","Ben Affleck","Val Kilmer"]', 0, 'easy'),

('Actors', 'Before becoming a film star, which Hollywood legend worked as a carpenter to pay the bills?',
 '["Harrison Ford","Robert De Niro","Al Pacino","Dustin Hoffman"]', 0, 'medium'),

('Actors', 'Which actress holds the record for the most Academy Award acting nominations with 21 nominations?',
 '["Meryl Streep","Katharine Hepburn","Bette Davis","Judi Dench"]', 0, 'easy'),

('Actors', 'Who plays T''Challa / Black Panther in the Marvel Cinematic Universe films?',
 '["Chadwick Boseman","Michael B. Jordan","Letitia Wright","Daniel Kaluuya"]', 0, 'easy'),

('Actors', 'Which actor has played James Bond the most times in official EON Productions films?',
 '["Roger Moore (7 films)","Sean Connery","Pierce Brosnan","Daniel Craig"]', 0, 'medium'),

('Actors', 'Who played the Wicked Witch of the West in the classic 1939 film The Wizard of Oz?',
 '["Margaret Hamilton","Billie Burke","Judy Garland","Patricia Morrison"]', 0, 'medium'),

('Actors', 'Which actor appeared in both Apocalypse Now and The Godfather as iconic characters?',
 '["Marlon Brando","Robert Duvall","Al Pacino","James Caan"]', 0, 'easy'),

('Actors', 'Who won the Academy Award for Best Actress for her role as Erin Brockovich?',
 '["Julia Roberts","Charlize Theron","Reese Witherspoon","Sandra Bullock"]', 0, 'easy'),

('Actors', 'Which actor won Best Actor at the Oscars for Dallas Buyers Club (2013)?',
 '["Matthew McConaughey","Jared Leto","Bruce Dern","Christian Bale"]', 0, 'easy'),

('Actors', 'Who played the scissor-handed outcast Edward Scissorhands in Tim Burton''s 1990 film?',
 '["Johnny Depp","Tim Roth","Gary Oldman","Brad Pitt"]', 0, 'easy'),

('Actors', 'Who plays the Joker and earns a posthumous Academy Award in The Dark Knight (2008)?',
 '["Heath Ledger","Jack Nicholson","Jared Leto","Joaquin Phoenix"]', 0, 'easy'),

('Actors', 'Which actress played both Scarlett O''Hara in Gone with the Wind and Blanche DuBois in A Streetcar Named Desire?',
 '["Vivien Leigh","Bette Davis","Joan Crawford","Olivia de Havilland"]', 0, 'hard'),

('Actors', 'Who was the first actor to win a posthumous Academy Award for Best Actor?',
 '["Peter Finch (Network, 1976)","Heath Ledger","Joaquin Phoenix","James Dean"]', 0, 'hard'),

('Actors', 'Which actor played both Vincent Vega in Pulp Fiction and Tony Manero in Saturday Night Fever?',
 '["John Travolta","Samuel L. Jackson","Bruce Willis","Harvey Keitel"]', 0, 'easy'),

('Actors', 'Who plays the eccentric archaeologist Alan Grant in Jurassic Park?',
 '["Sam Neill","Jeff Goldblum","Richard Attenborough","BD Wong"]', 0, 'medium');

-- ─── DIRECTORS (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Directors', 'Who directed Schindler''s List (1993)?',
 '["Steven Spielberg","Martin Scorsese","Francis Ford Coppola","Stanley Kubrick"]', 0, 'easy'),

('Directors', 'Which director made Goodfellas, Taxi Driver, Raging Bull, and The Departed?',
 '["Martin Scorsese","Brian De Palma","Michael Mann","Sidney Lumet"]', 0, 'easy'),

('Directors', 'Who directed both Citizen Kane (1941) and Touch of Evil (1958)?',
 '["Orson Welles","Howard Hawks","John Ford","Preston Sturges"]', 0, 'medium'),

('Directors', 'Which director is nicknamed "The Master of Suspense"?',
 '["Alfred Hitchcock","Fritz Lang","Henri-Georges Clouzot","Roman Polanski"]', 0, 'easy'),

('Directors', 'Who directed the original Star Wars: A New Hope (1977)?',
 '["George Lucas","Steven Spielberg","Irvin Kershner","Richard Marquand"]', 0, 'easy'),

('Directors', 'Which director''s Inception famously ends with a spinning top — a deliberately ambiguous ending?',
 '["Christopher Nolan","James Cameron","Ridley Scott","David Fincher"]', 0, 'easy'),

('Directors', 'Who directed the Spaghetti Western Dollars Trilogy: A Fistful of Dollars, For a Few Dollars More, and The Good, the Bad and the Ugly?',
 '["Sergio Leone","Sam Peckinpah","Howard Hawks","Don Siegel"]', 0, 'medium'),

('Directors', 'Which director won the Academy Award for Best Director for Mad Max: Fury Road (2015)?',
 '["None — it won many technical awards but not Best Director","George Miller","Ridley Scott","Zack Snyder"]', 0, 'hard'),

('Directors', 'Who directed Pulp Fiction and Django Unchained?',
 '["Quentin Tarantino","Robert Rodriguez","Richard Linklater","Steven Soderbergh"]', 0, 'easy'),

('Directors', 'Which Japanese director made Seven Samurai (1954) and Rashomon (1950)?',
 '["Akira Kurosawa","Yasujiro Ozu","Kenji Mizoguchi","Hiroshi Teshigahara"]', 0, 'easy'),

('Directors', 'Who directed the Lord of the Rings film trilogy?',
 '["Peter Jackson","Sam Raimi","Bryan Singer","David Cronenberg"]', 0, 'easy'),

('Directors', 'Which director won the Academy Award for Best Director for The Dark Knight''s predecessor Batman Begins?',
 '["No — Christopher Nolan has never won Best Director","Sam Mendes","Steven Spielberg","David Fincher"]', 0, 'hard'),

('Directors', 'Which filmmaker directed Alien (1979) and Blade Runner (1982) back to back?',
 '["Ridley Scott","James Cameron","John Carpenter","Paul Verhoeven"]', 0, 'easy'),

('Directors', 'Who was the first woman to win the Academy Award for Best Director?',
 '["Kathryn Bigelow (The Hurt Locker, 2009)","Sofia Coppola","Jane Campion","Greta Gerwig"]', 0, 'easy'),

('Directors', 'Which director collaborated with composer John Williams for over 40 years on films including Jaws and Schindler''s List?',
 '["Steven Spielberg","Ron Howard","George Lucas","Robert Zemeckis"]', 0, 'medium'),

('Directors', 'Who directed Apocalypse Now (1979), adapted from Joseph Conrad''s Heart of Darkness?',
 '["Francis Ford Coppola","Martin Scorsese","Oliver Stone","Stanley Kubrick"]', 0, 'easy'),

('Directors', 'Which director won the Academy Award for Best Director for American Beauty (1999)?',
 '["Sam Mendes","Ridley Scott","Spike Jonze","Michael Mann"]', 0, 'medium'),

('Directors', 'Who directed Wes Anderson''s debut feature film Bottle Rocket (1996)?',
 '["Wes Anderson","Sofia Coppola","David O. Russell","Paul Thomas Anderson"]', 0, 'hard'),

('Directors', 'Which director''s style features symmetrical compositions, pastel color palettes, and whimsical deadpan humor?',
 '["Wes Anderson","Michel Gondry","Spike Jonze","Tim Burton"]', 0, 'easy'),

('Directors', 'Who directed Children of Men (2006), known for its extraordinarily long unbroken tracking shots?',
 '["Alfonso Cuarón","Darren Aronofsky","Paul Thomas Anderson","Gaspar Noé"]', 0, 'hard'),

('Directors', 'Which director''s filmography includes The Silence of the Lambs, Philadelphia, and The Remains of the Day?',
 '["Jonathan Demme","Ridley Scott","Steven Soderbergh","Sydney Pollack"]', 0, 'hard'),

('Directors', 'Who directed the Oscar-winning historical drama Gandhi (1982)?',
 '["Richard Attenborough","David Lean","John Schlesinger","Tony Richardson"]', 0, 'medium');

-- ─── CLASSICS / Pre-1970 (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Classics', 'Which actress played Scarlett O''Hara in Gone with the Wind (1939)?',
 '["Vivien Leigh","Bette Davis","Joan Crawford","Olivia de Havilland"]', 0, 'easy'),

('Classics', 'What is the name of the beloved sled in Citizen Kane (1941)?',
 '["Rosebud","Snowflake","Charlie","Kane"]', 0, 'easy'),

('Classics', 'In what year was Casablanca released?',
 '["1942","1939","1944","1946"]', 0, 'medium'),

('Classics', 'Who starred in and directed The Great Dictator (1940), playing both a Jewish barber and a Hitlerian dictator?',
 '["Charlie Chaplin","Buster Keaton","Harold Lloyd","Orson Welles"]', 0, 'medium'),

('Classics', 'What was the first sound film to achieve major commercial success, released in 1927?',
 '["The Jazz Singer","Sunrise","Wings","Lights of New York"]', 0, 'medium'),

('Classics', 'Which German Expressionist film from 1920, about a sleepwalking murderer, is considered among the first horror films?',
 '["The Cabinet of Dr. Caligari","Nosferatu","Metropolis","The Golem"]', 0, 'hard'),

('Classics', 'Who played Rhett Butler in Gone with the Wind?',
 '["Clark Gable","Gary Cooper","Cary Grant","James Stewart"]', 0, 'easy'),

('Classics', 'Which 1968 Stanley Kubrick film, based on an Arthur C. Clarke story, features the AI HAL 9000?',
 '["2001: A Space Odyssey","Dr. Strangelove","Spartacus","Lolita"]', 0, 'easy'),

('Classics', 'Which Hitchcock film introduced the iconic slasher villain Norman Bates?',
 '["Psycho","Vertigo","The Birds","Rope"]', 0, 'easy'),

('Classics', 'In which classic musical does Gene Kelly dance joyfully in the rain?',
 '["Singin'' in the Rain (1952)","An American in Paris","The Band Wagon","Cover Girl"]', 0, 'easy'),

('Classics', 'Who directed Sunset Boulevard (1950), the dark tale of a faded silent film star?',
 '["Billy Wilder","John Huston","Howard Hawks","Elia Kazan"]', 0, 'medium'),

('Classics', 'Which film ends with the iconic final line "After all, tomorrow is another day!"?',
 '["Gone with the Wind","Rebecca","Now, Voyager","Mildred Pierce"]', 0, 'medium'),

('Classics', 'In which classic John Wayne Western did he win his only Academy Award for Best Actor?',
 '["True Grit (1969)","Stagecoach","The Searchers","Rio Bravo"]', 0, 'hard'),

('Classics', 'Which actress played the runaway princess experiencing Rome in Roman Holiday (1953)?',
 '["Audrey Hepburn","Grace Kelly","Elizabeth Taylor","Ingrid Bergman"]', 0, 'easy'),

('Classics', 'What is the character name Marlon Brando plays in A Streetcar Named Desire (1951)?',
 '["Stanley Kowalski","Terry Malloy","Emiliano Zapata","Marco"]', 0, 'medium'),

('Classics', 'Who played the title slave rebellion leader in Spartacus (1960)?',
 '["Kirk Douglas","Charlton Heston","Burt Lancaster","Tony Curtis"]', 0, 'medium'),

('Classics', 'Which Billy Wilder comedy features Marilyn Monroe, Tony Curtis, and Jack Lemmon all in a single jazz band?',
 '["Some Like It Hot (1959)","The Seven Year Itch","Bus Stop","Gentlemen Prefer Blondes"]', 0, 'medium'),

('Classics', 'In which Hitchcock thriller does a man on a train meet a stranger who proposes exchanging murders?',
 '["Strangers on a Train (1951)","Shadow of a Doubt","Dial M for Murder","Rope"]', 0, 'medium'),

('Classics', 'Which Federico Fellini film set in 1950s Rome coined the term "paparazzi" and won the Palme d''Or?',
 '["La Dolce Vita (1960)","8½","Amarcord","Satyricon"]', 0, 'hard'),

('Classics', 'Which 1927 Fritz Lang science-fiction film depicts a futuristic dystopian city divided by class?',
 '["Metropolis","M","Dr. Mabuse","Spies"]', 0, 'easy'),

('Classics', 'Who played George Bailey, the despairing man shown what life would be like without him, in It''s a Wonderful Life?',
 '["James Stewart","Cary Grant","Henry Fonda","Gary Cooper"]', 0, 'easy'),

('Classics', 'In what transition in the film industry is Singin'' in the Rain (1952) primarily set?',
 '["Silent films transitioning to talkies","Black-and-white to color","Stage musicals to film","International cinema to Hollywood"]', 0, 'medium');

-- ─── SCI-FI (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Sci-Fi', 'What is the name of the spaceship in 2001: A Space Odyssey (1968)?',
 '["Discovery One","USCSS Nostromo","Serenity","Event Horizon"]', 0, 'medium'),

('Sci-Fi', 'Who voiced the AI computer HAL 9000 in 2001: A Space Odyssey?',
 '["Douglas Rain","Keir Dullea","Gary Lockwood","Anthony Hopkins"]', 0, 'hard'),

('Sci-Fi', 'In The Matrix, which color pill lets Neo see the truth about the simulated world?',
 '["Red","Blue","Green","Purple"]', 0, 'easy'),

('Sci-Fi', 'What is the name of the alien moon that humans colonize in Avatar (2009)?',
 '["Pandora","Ego","Sakaar","Vormir"]', 0, 'easy'),

('Sci-Fi', 'What is the name of Matthew McConaughey''s character, a former NASA pilot, in Interstellar (2014)?',
 '["Joseph Cooper","Amelia Brand","Dr. Mann","TARS"]', 0, 'medium'),

('Sci-Fi', 'Which 2009 film by Neill Blomkamp features aliens called "prawns" confined to a South African slum?',
 '["District 9","Arrival","The Host","Edge of Tomorrow"]', 0, 'easy'),

('Sci-Fi', 'In what year is the original Blade Runner (1982) set?',
 '["November 2019","2049","2099","2029"]', 0, 'medium'),

('Sci-Fi', 'What is the name of the planet-destroying weapon in the original Star Wars?',
 '["Death Star","Star Destroyer","Eclipse","Starkiller Base"]', 0, 'easy'),

('Sci-Fi', 'Which Philip K. Dick short story was adapted into the film Total Recall (1990)?',
 '["We Can Remember It for You Wholesale","Do Androids Dream of Electric Sheep?","The Minority Report","A Scanner Darkly"]', 0, 'hard'),

('Sci-Fi', 'In which film does a linguist named Louise Banks attempt to decode an alien language?',
 '["Arrival","Contact","Signs","The Abyss"]', 0, 'easy'),

('Sci-Fi', 'What is the name of the fictional corporation behind the Weyland-Yutani bioweapon research in the Alien franchise?',
 '["Weyland-Yutani","Omni Consumer Products","InGen","Cyberdyne Systems"]', 0, 'medium'),

('Sci-Fi', 'In I Am Legend (2007), Will Smith plays a scientist who believes he is the last human survivor. What city is he in?',
 '["New York City","Washington D.C.","Los Angeles","Chicago"]', 0, 'medium'),

('Sci-Fi', 'Which 1984 James Cameron film features a time-traveling cyborg sent back to kill Sarah Connor?',
 '["The Terminator","RoboCop","Predator","Universal Soldier"]', 0, 'easy'),

('Sci-Fi', 'In which film does Jeff Goldblum''s Dr. Ian Malcolm say "Life, uh... finds a way"?',
 '["Jurassic Park","The Fly","Independence Day","Earth Girls Are Easy"]', 0, 'easy'),

('Sci-Fi', 'What model number is the Terminator sent back in time to protect John Connor in Terminator 2?',
 '["T-800","T-1000","T-X","T-850"]', 0, 'medium'),

('Sci-Fi', 'In WALL-E (2008), what is the name of the spaceship where the last humans live?',
 '["The Axiom","The Nostromo","The Discovery","The Endurance"]', 0, 'hard'),

('Sci-Fi', 'Which 2014 Christopher Nolan film involves a crew traveling through a wormhole near Saturn?',
 '["Interstellar","Inception","The Dark Knight Rises","Tenet"]', 0, 'easy'),

('Sci-Fi', 'In Alien (1979), what does the xenomorph use to implant its embryo into a host?',
 '["A facehugger","Its tail","A chest-bursting parasite","Its hands"]', 0, 'medium'),

('Sci-Fi', 'What dystopian YA world does Katniss Everdeen inhabit in The Hunger Games?',
 '["Panem","Gilead","Oceania","The Capitol"]', 0, 'easy'),

('Sci-Fi', 'Which 1982 film asks the question "What is human?" through a detective hunting bioengineered replicants?',
 '["Blade Runner","Alien","The Thing","Soylent Green"]', 0, 'medium'),

('Sci-Fi', 'In Inception, what does Arthur use to give himself and Cobb a "kick" while dreaming in zero gravity?',
 '["He drops them off a building in a hotel corridor","A loud noise","A bucket of water","A defibrillator"]', 0, 'hard'),

('Sci-Fi', 'Which sci-fi comedy features Bill Murray repeatedly reliving February 2nd?',
 '["Groundhog Day","Edge of Tomorrow","Source Code","About Time"]', 0, 'easy');

-- ─── ANIMATION (22 questions) ───

INSERT INTO questions (category, question, options, correct_index, difficulty) VALUES
('Animation', 'Which was Walt Disney''s first feature-length animated film, released in 1937?',
 '["Snow White and the Seven Dwarfs","Bambi","Pinocchio","Dumbo"]', 0, 'easy'),

('Animation', 'Which Studio Ghibli film features a magical bathhouse operated by the witch Yubaba?',
 '["Spirited Away","My Neighbor Totoro","Princess Mononoke","Howl''s Moving Castle"]', 0, 'easy'),

('Animation', 'What is the name of Simba''s father in The Lion King?',
 '["Mufasa","Scar","Rafiki","Zazu"]', 0, 'easy'),

('Animation', 'In which Pixar film does a rat named Remy dream of becoming a Parisian chef?',
 '["Ratatouille","Flushed Away","Fantastic Mr. Fox","The Tale of Despereaux"]', 0, 'easy'),

('Animation', 'In Toy Story, who is the main human antagonist who terrorizes toys?',
 '["Sid Phillips","Al McWhiggin","Stinky Pete","Lotso"]', 0, 'medium'),

('Animation', 'In Finding Nemo, what type of fish is the clownfish Nemo?',
 '["Ocellaris clownfish","Blue tang","Surgeonfish","Angelfish"]', 0, 'easy'),

('Animation', 'Which face-stealing spirit appears in Spirited Away as a lonely, mask-wearing figure?',
 '["No-Face (Kaonashi)","Yubaba","The River Spirit","Haku"]', 0, 'easy'),

('Animation', 'In The Little Mermaid, who steals Ariel''s voice?',
 '["Ursula","Morgana","Flotsam and Jetsam","King Triton"]', 0, 'easy'),

('Animation', 'What is the name of the enthusiastic talking dog in Pixar''s Up?',
 '["Dug","Buck","Rex","Bingo"]', 0, 'easy'),

('Animation', 'In Inside Out, which emotion is depicted as dominant when Riley is a happy young child?',
 '["Joy","Sadness","Fear","Disgust"]', 0, 'easy'),

('Animation', 'Which animated Disney film features the villain''s song "Be Prepared"?',
 '["The Lion King","Aladdin","The Hunchback of Notre Dame","Hercules"]', 0, 'medium'),

('Animation', 'What is the name of the tiny dragon guardian in Disney''s Mulan?',
 '["Mushu","Sisu","Elliot","Pascal"]', 0, 'easy'),

('Animation', 'Which Pixar film is inspired by the Mexican holiday Día de los Muertos and set in the Land of the Dead?',
 '["Coco","The Book of Life","El Dorado","Encanto"]', 0, 'easy'),

('Animation', 'What is the name of the inflatable robot healthcare companion in Big Hero 6?',
 '["Baymax","Hiro","Bot","Megabot"]', 0, 'easy'),

('Animation', 'Which animated show features the Griffin family in the fictional town of Quahog, Rhode Island?',
 '["Family Guy","American Dad","Bob''s Burgers","The Simpsons"]', 0, 'easy'),

('Animation', 'What happens to Merida''s mother as the accidental result of a witch''s spell in Brave?',
 '["She is transformed into a bear","She disappears","She ages rapidly","She shrinks to mouse size"]', 0, 'easy'),

('Animation', 'Which Studio Ghibli film follows two sisters, Satsuki and Mei, who encounter a forest spirit?',
 '["My Neighbor Totoro","Spirited Away","Kiki''s Delivery Service","Castle in the Sky"]', 0, 'easy'),

('Animation', 'What magical gift does Mirabel discover she lacks in Disney''s Encanto?',
 '["She has no gift","Super strength","Future sight","Animal communication"]', 0, 'medium'),

('Animation', 'Which Disney Renaissance film features the songs "A Whole New World" and "Friend Like Me"?',
 '["Aladdin","The Little Mermaid","Beauty and the Beast","Mulan"]', 0, 'easy'),

('Animation', 'In Shrek (2001), what is the name of the kingdom ruled by the pompous Lord Farquaad?',
 '["Duloc","Far Far Away","Worcestershire","Neverland"]', 0, 'medium'),

('Animation', 'Which Pixar film opens with a wordless 10-minute montage covering an entire marriage?',
 '["Up","WALL-E","Inside Out","Soul"]', 0, 'easy'),

('Animation', 'What is the name of the villain posing as a superhero''s ally in The Incredibles?',
 '["Syndrome","Underminer","Screenslaver","Bomb Voyage"]', 0, 'easy');
