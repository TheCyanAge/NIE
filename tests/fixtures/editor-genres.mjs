// Six invented texts of different kinds, for tests/editor.test.js: a first-person memoir, a screenplay (sluglines and speaker cues), a sequence of poems, an essay (a numbered
// list, a cited study, "the Moon"), a dialogue-heavy chapter and a text with no sentences at all. Written by hand to trip an instrument that mistakes a month for a name, a
// cue for a term, a verse line for a sentence or a list number for a figure; nothing here is a real work, person or organisation.
// Each text is checked against what is IN it (counts recomputed from the text), never against the output of a first run.

export const MEMOIR = `Chapter 1: The Farm at Pantglas

I was born in March, in the cold back bedroom of a farmhouse that my father swore had never once been warm. Mum used to say that I arrived on a Sunday so that nobody could blame the doctor for being at chapel. Dad said it was the Moon, which was full that night, and that a child born under a full Moon would never sleep. He was right about that, at least. I have not slept properly since 1974.

Then came the winter. Aunt Dilys moved in with her canary and her three trunks and her opinions about everything from porridge to politics. She was seventy years old and had never married, and she told me this fact so often that I thought it was a kind of achievement. Later I understood that it was a warning. Sometimes I still hear her voice in the kitchen, correcting the way I hold a spoon.

We had forty sheep in those days, and one dog, and a tractor that Dad kept alive with string and prayer. Every morning I walked down to the gate with a bucket, and every morning Mrs Pryce waved to me from the lane. She lived in the next valley and she never once came closer than the gate. I thought she was frightened of the dog. It was years before I learned that she was frightened of Dad.

Chapter 2: Cardiff

When I was nine we left the farm. Dad sold the sheep, all sixty of them, and the tractor went to a man from Brecon who paid in cash and did not look at it twice. We drove to Cardiff in a borrowed van with Aunt Dilys sitting on a trunk in the back. I remember that the canary sang the whole way, and that Mum cried quietly in the front seat, and that nobody said a word about it.

The house in Cardiff had a bathroom indoors. I stood in it for a long time on the first night, turning the tap on and off, watching the water arrive as if it were a miracle. Afterwards Mum found me there and sat on the edge of the bath and said nothing at all. Then she laughed, and so did I, and for a minute the whole move seemed worth it.

On Monday I started at the school on Cathays Road. Mrs Pryce, I discovered, had moved to Cardiff a year before us, and she was my teacher. She looked at me across the classroom with an expression I could not read. Then she said that I would be sitting at the front, where she could see me, and the other children laughed.

Chapter 3: The Summer of the Strike

By June of that year the whole street had stopped working. Dad stood at the window every morning and watched the men go by with their flags. Mum took in washing. Aunt Dilys sold the canary, and I did not forgive her for it until she died, which was in October, on a Tuesday, in the same chair where she had told me for so long that she was seventy.

I was ten years old that summer and I thought the world was ending. It was not. It was only changing shape, as it always does, and the shape it took was Dad coming home one evening with a job at the docks and a new coat and a smile that did not reach his eyes. We never spoke about the farm again.

Chapter 4: Leaving

I left Cardiff in September, with one suitcase and the address of a cousin in Leeds. Mum stood on the platform and held my face in both her hands. Dad did not come. He said he had a shift. I have since learned that there was no shift, and that he stood on the bridge above the station and watched the train go out.

Years later I wrote to Mrs Pryce, and she wrote back. She said that she had never been frightened of the dog.
`;

export const SCREENPLAY = `FADE IN:

INT. DESMOND'S KITCHEN - NIGHT

A small kitchen. One bulb. A kettle ticks as it cools. NORA, thirties, sits at the table with a stack of unopened letters. DESMOND, her brother, stands in the doorway with his coat still on.

NORA
You said you'd be back by eight.

DESMOND (O.S.)
The bus was late.

NORA
The bus is always late. That's not an excuse, that's a timetable.

Desmond crosses to the sink. Runs the tap. Watches the water as if it might say something.

DESMOND
Is Mum asleep?

NORA
She's been asleep since six. She's been asleep since March, if you ask me.

CUT TO:

EXT. HARBOUR - DAWN

Grey light. Gulls. A fishing boat noses in past the breakwater. On the quay, MRS PRYCE, seventies, waits with a folded umbrella although it is not raining.

MRS PRYCE
(calling)
You're late again, Captain.

A figure on the boat lifts one hand. We do not see his face.

INT. DESMOND'S KITCHEN - MORNING

Nora has not moved. The letters are still on the table. The bulb is still on.

NORA
I called the council. They said it takes sixty days.

DESMOND
Sixty days for what?

NORA
For anything. They said it takes sixty days for anything.

Desmond sits. Takes one of the letters. Does not open it.

DESMOND
Mum wouldn't want us fighting about this.

NORA
Mum doesn't want anything. That's the whole problem.

DISSOLVE TO:

INT. HOSPITAL CORRIDOR - DAY

A long corridor. Fluorescent hum. Nora walks fast, Desmond a step behind. A NURSE steps out of a side room and stops them with a raised palm.

NURSE
Family only.

NORA
We are the family.

NURSE
Then you can go in. Both of you.

They look at each other. Neither moves.

DESMOND
You first.

NORA
No. You.

FADE OUT.

THE END
`;

export const POEMS = `The Salt Road

I.

Down to the water the long road goes,
down past the chapel, down past the mill,
and nobody walks it who does not know
what the water wants and what it will.

Down to the water the long road goes,
the gulls above it, the stones below,
and the tide comes in as the tide has done
since before there was anyone to know.

II.

My mother kept a lamp in the window.
My mother kept a lamp in the window
and every night the boats came in
toward the little light, the yellow light,
the light that was not a promise
but was, all the same, a kind of keeping.

My father kept a count of the boats.
My father kept a count of the boats
and every night he wrote the number down
in a book with a green cloth cover
that I was never allowed to open.

III.

Down to the water the long road goes.
I have come back in November
with a coat that is too thin
and a name that nobody uses.

The chapel has no roof now.
The mill is a wall and a wheel.
The lamp is gone from the window
and the window is gone from the wall.

IV. Tide Table

Low at six. High at noon.
Low again, and the light goes soft.
High at midnight. Nobody up.
Low at six. High at noon.

Low at six. High at noon.
Low again, and the light goes soft.
High at midnight. Nobody up.
Low at six. High at noon.

V.

Down to the water the long road goes,
down past the chapel, down past the mill,
and somebody walks it who does not know
what the water wants and what it will.
`;

export const ESSAY = `On Walking Slowly

Most arguments about speed begin with the assumption that faster is better. In 1998 a study of 32 commuters in Manchester found that those who walked to work reported lower stress than those who drove, and the authors, Hale and Prior, drew the obvious conclusion. But the obvious conclusion is rarely the interesting one.

Consider three claims. First, that walking is slower than driving. Second, that slowness is a cost. Third, that the cost is worth paying. The first claim is true. The second is an assumption. The third is a choice that each of us makes, mostly without noticing, every morning.

1. Slowness shows you things.
2. Slowness gives you time to change your mind.
3. Slowness is the only speed at which a city can be read.

The Moon, for example, rises at a different place every night, and a person who walks home at dusk will see it where a person in a car will not. The Moon is not important here. What matters is the habit of looking up, which is a habit of the slow.

Critics will say that this is a luxury. They are partly right. A nurse on a double shift cannot walk four miles to the hospital. A courier paid by the delivery cannot afford to dawdle. But luxury is not the same as irrelevance, and the fact that some people cannot choose slowness is an argument for giving them more of it, not for abandoning the idea.

In March, Prior revised her figures. The 32 commuters had become 41, and the stress reduction she had reported as 18 percent was now 12 percent. This does not undermine the claim. It complicates it, which is what good evidence is supposed to do.

Smith, writing in 2004, put it more bluntly: the city is a text, and most of us skim. I think he was right. I also think that skimming is not a failing of character but a response to design. Pavements are narrow. Crossings are short. Everything is arranged so that you will keep moving.

So walk slowly, if you can. If you cannot, ask why not, and who decided.
`;

export const DIALOGUE = `Chapter 7

"You're not going," said Imogen.

"I am." Tobias picked up the bag. "The train is at six."

"The train is always at six." She stood between him and the door. "That's not a reason."

"It's a time."

"It's a time you chose."

He put the bag down. "Imogen, please."

"Don't say please. You say please when you've already decided." She crossed her arms. "What did Marsh say?"

"Nothing."

"Tobias."

"He said nothing, all right? He said the post was mine if I wanted it." Tobias looked at the floor. "He said it twice."

"And you said?"

"I said I'd think about it."

"You said you'd think about it." She laughed, short and without any pleasure. "You've been thinking about it since March."

"That isn't fair."

"It isn't meant to be fair, it's meant to be true." Imogen stepped aside. "Go on. Go. But don't tell me later that I didn't ask."

Tobias did not move. Outside a car went by, then another. "Come with me," he said.

"Where? To Leeds?"

"To Leeds. To anywhere. To the station, if that's all."

"I have a job."

"You hate the job."

"I hate the job," Imogen agreed. "I hate it in a way I understand. That's different from Leeds."

"Is it?"

"Ask me again at six," she said, and went to put the kettle on.

Chapter 8

"Well?" said Marsh. "Is he coming?"

"He is," said Imogen. "He's at the station."

"Then why are you here?"

"Because I wanted to see your face." She sat down. "Forty minutes, Mr Marsh. That's how long he took to decide, in the end. Forty minutes, after eleven years."

Marsh said nothing. He turned the pen over in his fingers. "I did offer him the post," he said at last.

"You offered it twice."

"Who told you that?"

"He did."

"Then he told you wrong. Three times." Marsh put the pen down. "I asked him three times, Miss Hale."

"Then he's a worse liar than I thought," said Imogen, and she was smiling when she said it.
`;

export const NOSENT = `Chapter 1

north east south west
north east south west
north east south west

Chapter 2

12 14 16 18 20 22
24 26 28 30 32 34

Chapter 3

 * * * 

apple    pear    plum
cherry   fig     date

Chapter 4

ohm ohm ohm ohm ohm ohm ohm ohm ohm ohm
ohm ohm ohm ohm ohm ohm ohm ohm ohm ohm
`;

// A first-person text whose narrator says "I'd", "I'm", "I'll" and "I've" all the time, with the traps of ordinary prose: feasts, languages, "Figure 3", "Day Two", interjections.
const sentence = `I'd never seen the sea. I'll say that now. I've told nobody, and I'm not sure why I'm telling you. When I'd finished the letter I'd put it away. Yet I'm here, and I'll stay. Maybe I'd go back. Dr Okafor had said I'd be fine. "I'm fine," I'd said. Tom said he'd come, and Tom's brother said he'd wait. Tom, Ana and I walked. Tom laughed. Ana frowned. Okay, OK, so I said Yes to Ana and No to Tom. Mother and Father stayed. Uncle Joe said Hello. Hello, said Ana. See Figure 3 and Table 2 and Day Two. We spoke English at Christmas and French at Easter. `;
const pad = 'The wind blew across the open ground and nobody spoke of it again, though everyone remembered. '.repeat(3);
export const FIRST_PERSON = [1, 2, 3, 4, 5].map((n) => `Chapter ${n}\n\n${sentence.replace('Figure 3', `Figure ${n}`).replace('Table 2', `Table ${n}`).replace('Day Two', `Day ${n}`)}${pad}`).join('\n\n');
