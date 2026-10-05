#!/usr/bin/env python3
"""Emit KS2 draft topic TypeScript from compact specs. Run from repo root."""

from __future__ import annotations

import json
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]


def q(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def emit_list(items: list[str], indent: int) -> str:
    pad = " " * indent
    return "\n".join(f"{pad}{q(item)}," for item in items)


def emit_say(items: list, indent: int) -> str:
    pad = " " * indent
    lines = []
    for item in items:
        if isinstance(item, dict):
            extra = f", listenFor: {q(item['listenFor'])}" if item.get("listenFor") else ""
            lines.append(f"{pad}{{ prompt: {q(item['prompt'])}{extra} }},")
        else:
            lines.append(f"{pad}{q(item)},")
    return "\n".join(lines)


def emit_mis(items: list[dict], indent: int) -> str:
    pad = " " * indent
    inner = " " * (indent + 2)
    blocks = []
    for item in items:
        blocks.append(
            f"{pad}{{\n{inner}misconception: {q(item['misconception'])},\n"
            f"{inner}why: {q(item['why'])},\n{inner}instead: {q(item['instead'])},\n{pad}}},"
        )
    return "\n".join(blocks)


def emit_checks(items: list[dict], indent: int) -> str:
    pad = " " * indent
    inner = " " * (indent + 2)
    blocks = []
    for item in items:
        blocks.append(
            f"{pad}{{\n{inner}prompt: {q(item['prompt'])},\n"
            f"{inner}looksLike: {q(item['looksLike'])},\n{inner}notYet: {q(item['notYet'])},\n"
            f"{inner}nudge: {q(item['nudge'])},\n{pad}}},"
        )
    return "\n".join(blocks)


def emit_spec(spec: dict) -> str:
    prereq = spec.get("prerequisites") or []
    rtp = spec.get("readyToProgress") or []
    tip = spec.get("tip")
    stretch = spec.get("stretch")
    stop = spec.get("stopRule")
    lines = [
        "  ks2MathsDraft({",
        f"    id: {q(spec['id'])},",
        f"    year: {spec['year']},",
        f"    strand: {q(spec['strand'])},",
        f"    title: {q(spec['title'])},",
        f"    shortTitle: {q(spec['shortTitle'])},",
        f"    summary: {q(spec['summary'])},",
        f"    prerequisites: [{', '.join(q(x) for x in prereq)}],",
        "    statutoryOutcomes: [",
        emit_list(spec["statutoryOutcomes"], 6),
        "    ],",
        f"    readyToProgress: [{', '.join(q(x) for x in rtp)}],",
        f"    whyThisMatters: {q(spec['whyThisMatters'])},",
        f"    inPlainEnglish: {q(spec['inPlainEnglish'])},",
        f"    howSchoolTeachesIt: {q(spec['howSchoolTeachesIt'])},",
        "    sayThis: [",
        emit_say(spec["sayThis"], 6),
        "    ],",
        "    avoidThis: [",
        emit_list(spec["avoidThis"], 6),
        "    ],",
        "    misconceptions: [",
        emit_mis(spec["misconceptions"], 6),
        "    ],",
        f"    youAreReadyWhen: {q(spec['youAreReadyWhen'])},",
        "    householdItems: [",
        emit_list(spec["householdItems"], 6),
        "    ],",
        f"    setup: {q(spec['setup'])},",
        f"    activityTitle: {q(spec['activityTitle'])},",
        "    steps: [",
        emit_list(spec["steps"], 6),
        "    ],",
    ]
    if tip:
        lines.append(f"    tip: {q(tip)},")
    lines.append("    check: [")
    lines.append(emit_checks(spec["check"], 6))
    lines.append("    ],")
    if stretch:
        lines.append(f"    stretch: {q(stretch)},")
    if stop:
        lines.append(f"    stopRule: {q(stop)},")
    lines.append("  }),")
    return "\n".join(lines)


def write_year(year: int, specs: list[dict]) -> None:
    export = f"year{year}MathsTopics"
    body = "\n".join(emit_spec(spec) for spec in specs)
    text = dedent(
        f"""\
        import {{ ks2MathsDraft }} from "@/content/england/ks2/draft";
        import type {{ Topic }} from "@/content/schema";

        export const {export}: Topic[] = [
        """
    ) + body + "\n];\n"
    path = ROOT / f"src/content/england/ks2/year-{year}/maths/topics.ts"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    print(f"wrote {path} ({len(specs)} topics)")


def t(**kwargs):
    return kwargs


def mis(misconception: str, why: str, instead: str) -> dict:
    return {"misconception": misconception, "why": why, "instead": instead}


def chk(prompt: str, looksLike: str, notYet: str, nudge: str) -> dict:
    return {"prompt": prompt, "looksLike": looksLike, "notYet": notYet, "nudge": nudge}


YEAR3 = [
    t(
        id="y3-hundreds-tens-ones",
        year=3,
        strand="Number and place value",
        title="Hundreds, tens and ones",
        shortTitle="3-digit place value",
        summary="See what each digit is worth in a three-digit number, not just read it left to right.",
        statutoryOutcomes=[
            "Recognise the place value of each digit in a 3-digit number (100s, 10s, 1s)",
            "Read and write numbers up to 1,000 in numerals and in words",
        ],
        readyToProgress=["3NPV-2"],
        whyThisMatters="Later written methods only work if 4 in 405 is four hundreds, not four ones. Year 3 locks that in.",
        inPlainEnglish="In 405, the 4 is four hundreds, the 0 is no tens, and the 5 is five ones. The place of a digit tells you its worth. 405 is not 4, 0 and 5 sitting as three small numbers.",
        howSchoolTeachesIt="School builds the number with hundreds, tens and ones — straws in bundles, base-ten blocks, or money (pounds as hundreds if you treat 1p as one). They also split the number in unusual ways, such as 405 as 3 hundreds and 10 tens and 5 ones, so the child is not stuck on only one picture.",
        sayThis=[
            {"prompt": "In 372, what is the 7 worth?", "listenFor": "70, or seven tens."},
            "Can you make 372 with hundreds, tens and ones?",
            "Show me 372 another way — maybe using extra tens instead of a hundred.",
        ],
        avoidThis=[
            "Calling the digits ‘the first number, the middle number, the last number’ without saying hundreds, tens, ones.",
            "Jumping to the written adding method before they can say what each digit is worth.",
        ],
        misconceptions=[
            mis(
                "They read 405 as four hundred and five but think the 0 ‘does nothing’, so they write 45.",
                "Zero is holding the tens place. Without it, the 4 would be forty.",
                "Build 405 and 45 side by side. Point to the empty tens place and say it still matters.",
            ),
            mis(
                "They say the 3 in 305 is ‘3’ not three hundreds.",
                "They can name the digit but not its worth.",
                "Ask ‘how many hundreds?’ and match it to three hundred-objects or three £1 coins if 1p is one.",
            ),
        ],
        youAreReadyWhen="You can point to any digit in a three-digit number and say its worth in ordinary words.",
        householdItems=[
            "About 12 objects that can stand for ones, such as spoons, Lego, or dried pasta",
            "Something to bundle tens, such as elastic bands, cups, or ten-hole egg boxes",
            "Scrap paper for writing the number",
        ],
        setup="Sit with a pile of small objects. Decide that one object is one, a bundle or cup of ten is a ten, and ten of those cups (or a drawn ‘hundred square’ of 10 tens) is a hundred. You do not need 400 objects — draw the hundreds if the pile is small.",
        activityTitle="Build and rebuild a three-digit number",
        steps=[
            "Write 246. Build it: 2 hundreds (drawn or bundled), 4 tens, 6 ones. Say ‘2 hundreds, 4 tens, 6 ones’.",
            "Swap: turn one hundred into ten tens. Ask if it is still 246.",
            "Hide the tens. Ask what is missing if the number is still 246.",
            "Repeat with 305, so they have to show zero tens.",
        ],
        tip="If they run out of objects, drawing sticks of ten is fine. The talk is the point.",
        check=[
            chk("What is the 4 worth in 405?", "Four hundreds, or 400.", "Four, or forty, or they read the whole number instead.", "Cover the 0 and 5. Ask how many hundreds that 4 stands for."),
            chk("Make 132 two different ways.", "For example 1 hundred 3 tens 2 ones, and 13 tens 2 ones.", "Only one arrangement, or they mix the digits up.", "Start with the usual hundreds-tens-ones, then trade one hundred for ten tens."),
            chk("Write the number that is 3 hundreds, 0 tens, 8 ones.", "308.", "38 or 380.", "Put a card in the tens place that says 0. Read it as three hundred and eight."),
        ],
        stretch="Ask which is more: 3 hundreds or 28 tens. Let them build both.",
    ),
    t(
        id="y3-ten-or-hundred-more-less",
        year=3,
        strand="Number and place value",
        title="Ten or a hundred more or less",
        shortTitle="10 or 100 more/less",
        summary="Jump 10 or 100 without recounting the whole number from one.",
        prerequisites=["y3-hundreds-tens-ones"],
        statutoryOutcomes=["Count from 0 in multiples of 4, 8, 50 and 100; find 10 or 100 more or less than a given number"],
        readyToProgress=["3NPV-3"],
        whyThisMatters="Adding 10 or 100 should feel like moving a digit, not a new sum every time. That fluency feeds mental calculation.",
        inPlainEnglish="10 more than 346 is 356: only the tens digit changes. 100 more is 446: only the hundreds digit changes. Sometimes you have to roll over, such as 10 more than 396.",
        howSchoolTeachesIt="School uses a hundred square, a number line marked in tens, and place-value charts. They want the child to see which digit moves, and to notice when a jump spills into the next hundred.",
        sayThis=[
            {"prompt": "What is 10 more than 346?", "listenFor": "356."},
            "Which digit changed? Which digits stayed the same?",
            "What about 10 more than 396 — what has to roll over?",
        ],
        avoidThis=[
            "Counting on in ones for +10 or +100 once they can see the place-value jump.",
            "Saying ‘just add a zero’ — that confuses ×10 with +10.",
        ],
        misconceptions=[
            mis("They add 10 to the ones digit, so 346 + 10 becomes 347 or 356 written as 3460.", "They are not sure which column 10 lives in.", "Build 346, add one ten-bundle, and write the new number."),
            mis("They freeze when the tens digit is 9.", "Rollover feels like a different rule.", "Practise 90 + 10 = 100 with objects first, then 190 + 10, then 396 + 10."),
        ],
        youAreReadyWhen="You can say 10 more, 10 less, 100 more and 100 less than a three-digit number, including when a digit is 9.",
        householdItems=["Scrap paper", "A homemade number line from 0 to 100, or a printed hundred square if you already have one", "Ten objects to stand for tens if you want to build the jump"],
        setup="Write a starting number such as 346. Sketch a simple line marked 300, 310, … 400 if that helps. Keep a pile of ten-bundles or drawn tens nearby.",
        activityTitle="Jump 10, then jump 100",
        steps=[
            "Start at 346. Add one ten. Write 356. Say which digit moved.",
            "From 356 take ten away. Check you are back.",
            "From 346 add one hundred. Write 446.",
            "Try a rollover: 10 more than 396, then 100 more than 960 (draw it if you have no objects).",
        ],
        check=[
            chk("10 less than 250.", "240.", "249 or 150.", "Move one ten-bundle away, or hop back one ten on the line."),
            chk("100 more than 705.", "805.", "715 or 7050.", "Change only the hundreds digit. The 0 tens and 5 ones stay."),
            chk("10 more than 394.", "404.", "304, 395, or 3104.", "Nine tens plus one ten makes another hundred. Trade ten tens for one hundred."),
        ],
        stretch="Give a number. Ask them to get to the next hundred using only jumps of 10.",
    ),
    t(
        id="y3-count-in-4-8-50-100",
        year=3,
        strand="Number and place value",
        title="Counting in 4s, 8s, 50s and 100s",
        shortTitle="Count in 4, 8, 50, 100",
        summary="Keep a steady jump of 4, 8, 50 or 100, not a new count from 1 each time.",
        prerequisites=["y3-hundreds-tens-ones"],
        statutoryOutcomes=["Count from 0 in multiples of 4, 8, 50 and 100; find 10 or 100 more or less than a given number"],
        whyThisMatters="These jumps feed the 4 and 8 times tables and make 50 and 100 feel like units you can hop.",
        inPlainEnglish="Counting in 4s is 0, 4, 8, 12, 16… Equal jumps. 8s double that pattern. 50s and 100s are the same idea with bigger steps.",
        howSchoolTeachesIt="School often uses a number line or a hundred square and colours the landing numbers. They link 4s and 8s by doubling. They do not want a chant with no picture of the jump.",
        sayThis=[
            "Start at 0. Jump 4 each time. Where do you land?",
            "If 4, 8, 12 is the 4-jump, what happens if each jump is twice as far?",
            "Count 50, 100, 150… when should we stop tonight?",
        ],
        avoidThis=[
            "Racing through a tables chant with no objects or line.",
            "Mixing the step size mid-count without saying you have changed the jump.",
        ],
        misconceptions=[
            mis("They add 4 to the previous answer wrongly, such as 12 then 15.", "They slipped into +3 or counted objects one-by-one and lost the group.", "Keep four objects in a cup and add a new cup each time."),
            mis("They can chant 4, 8, 16, 24 — skipping 12.", "The chant is half-remembered, not a jump.", "Walk the line and land on every 4."),
        ],
        youAreReadyWhen="You can keep a 4-jump and an 8-jump going, and you can hop 50s and 100s from 0 past 200.",
        householdItems=["A strip of paper for a number line", "Small objects in groups of 4, such as Lego or pasta", "A cup or plate for each group"],
        setup="Draw a line. Mark 0. Decide the jump (start with 4). Have objects ready to make matching groups.",
        activityTitle="Cups of 4, then a bigger jump",
        steps=[
            "Make groups of 4. After each new group, write the total under the line: 4, 8, 12…",
            "When that is steady, double a 4-group into 8 and count 8, 16, 24, stopping before 15 minutes.",
            "On paper only, hop 0, 50, 100, 150, 200.",
            "Hop 0, 100, 200, 300.",
        ],
        check=[
            chk("Count four jumps of 4 from 0.", "4, 8, 12, 16.", "Uneven jumps or missing 12.", "Add one cup of 4 at a time and write the total."),
            chk("What is the next 8 after 24?", "32.", "30 or 28.", "Double the 4-jump: 12 doubled is 24, 16 doubled is 32."),
            chk("Count three 50s from 0.", "50, 100, 150.", "They count in 5s or 10s.", "Think 50 as half of 100. Two 50s make 100, three make 150."),
        ],
        stretch="Start at 4 (not 0) and keep jumping 4. Notice it is the same landing spots.",
    ),
    t(
        id="y3-order-numbers-to-1000",
        year=3,
        strand="Number and place value",
        title="Compare and order numbers to 1,000",
        shortTitle="Order to 1,000",
        summary="Put three-digit numbers in size order by looking at hundreds, then tens, then ones.",
        prerequisites=["y3-hundreds-tens-ones"],
        statutoryOutcomes=[
            "Compare and order numbers up to 1,000",
            "Identify, represent and estimate numbers using different representations",
        ],
        readyToProgress=["3NPV-3"],
        whyThisMatters="Ordering is how children check whether an answer is sensible. 701 is not ‘a bit more than 70’.",
        inPlainEnglish="To compare 701 and 698, look at hundreds first: 7 hundreds beats 6 hundreds, so 701 is greater even though 98 looks ‘big’.",
        howSchoolTeachesIt="School uses number lines to 1,000, place-value cards, and the signs < and >. They estimate a number’s place between hundreds before they fuss over ones.",
        sayThis=[
            "Which is greater, 701 or 698? How do you know?",
            "Put 405, 450 and 504 in order, smallest first.",
            "About where would 760 sit between 700 and 800?",
        ],
        avoidThis=[
            "Comparing from the ones digit first, as if they were all one-digit numbers.",
            "Teaching the crocodile ‘eats the bigger number’ with no talk of hundreds and tens.",
        ],
        misconceptions=[
            mis("They say 98 is greater than 101 because 98 ‘looks bigger’.", "They compare digit shapes, not place value.", "Build both numbers. 101 has a hundred; 98 does not."),
            mis("They order 405, 450, 45 as if extra zeros do not matter.", "Zero in the tens or ones place is still a place.", "Line the digits in columns: hundreds under hundreds."),
        ],
        youAreReadyWhen="You can order three three-digit numbers and say which place you looked at first.",
        householdItems=["Three-digit numbers written on scrap paper or sticky notes", "A long strip of paper for a 0–1,000 line, marked 0, 100, 200 … 1,000"],
        setup="Mark a 0–1,000 line with hundreds. Write six numbers such as 405, 450, 504, 99, 701, 698.",
        activityTitle="Peg the numbers on the line",
        steps=[
            "Place 99 and 101 first. Talk about why 101 is further along.",
            "Place 701 and 698. Check hundreds first.",
            "Place 405, 450, 504. Read them in order smallest to largest.",
            "Ask which two are closest together, and why.",
        ],
        check=[
            chk("Which is smaller: 399 or 410?", "399.", "410, because 1 is small.", "Compare hundreds: 3 hundreds against 4 hundreds."),
            chk("Order 216, 261, 126.", "126, 216, 261.", "Sorted by the first digit they see without place value.", "Line hundreds, then tens, then ones."),
            chk("Point to about 760 on the 700–800 stretch.", "Closer to 800 than to 700, past the middle.", "At 700, or at 706.", "Halfway is 750. 760 is a little past halfway."),
        ],
        stretch="Give a number between 500 and 600 that is closer to 600 than 500. Ask them to justify.",
    ),
    t(
        id="y3-mental-add-subtract",
        year=3,
        strand="Addition and subtraction",
        title="Add and subtract 1s, 10s or 100s in your head",
        shortTitle="Mental +/− 1s 10s 100s",
        summary="Change one place at a time: 572 + 3, 572 + 40, 572 − 100, without always writing a sum.",
        prerequisites=["y3-ten-or-hundred-more-less"],
        statutoryOutcomes=[
            "Add and subtract numbers mentally, including a three-digit number and 1s, 10s and 100s",
        ],
        whyThisMatters="Not every change needs the full written method. School wants a mental habit for ‘just the ones’, ‘just the tens’, ‘just the hundreds’.",
        inPlainEnglish="572 + 40 means four more tens: 612 if it rolls over, or 612… wait: 7 tens + 4 tens = 11 tens, so 612. You can hold the hundreds and ones still while the tens move.",
        howSchoolTeachesIt="School uses a place-value chart and jottings, not empty ‘in your head’ pressure. Children may write a tiny note of the new tens. They still use objects when a rollover is new.",
        sayThis=[
            {"prompt": "What is 572 add 3?", "listenFor": "575."},
            "Now 572 add 40. Which digit is doing the work?",
            "572 take away 100. What stayed the same?",
        ],
        avoidThis=[
            "Forcing a full written layout for +3 or −100 every time.",
            "Banning jottings. A tiny place-value note is still ‘mental’ in Year 3.",
        ],
        misconceptions=[
            mis("They add 40 to the ones, getting 576 or 57240.", "They have not chosen the tens place.", "Say ‘four tens’ while pointing at the tens digit."),
            mis("They change every digit a little bit, so 572 − 100 becomes 462 or 471.", "They think subtract means ‘make each digit smaller’.", "Build 572 and remove one hundred only."),
        ],
        youAreReadyWhen="You can do a three-digit number plus or minus 1s, 10s or 100s, and you know when a digit will roll over.",
        householdItems=["Place-value columns drawn on paper (Hundreds | Tens | Ones)", "Digit cards or scraps showing 0–9", "Optional: bundled objects for one rollover example"],
        setup="Draw H | T | O columns. Put 5, 7, 2 in the columns.",
        activityTitle="Change one column",
        steps=[
            "Add 3 ones. Write 575. Put the old number back.",
            "Add 4 tens. Talk through 7 tens + 4 tens. Write the new number.",
            "Take away 1 hundred. Write 472.",
            "Do one rollover: 572 + 8 ones, or 572 + 30 if they are ready.",
        ],
        check=[
            chk("348 + 50.", "398.", "398 written as 353 or 848.", "Five more tens. The 3 hundreds and 8 ones stay."),
            chk("620 − 100.", "520.", "610 or 619.", "Remove one hundred. Tens and ones stay 20."),
            chk("295 + 7.", "302.", "2912 or 212.", "5 + 7 ones make 12 ones: that is 1 ten and 2 ones, so the tens tick over too."),
        ],
        stretch="Start at 808. Subtract 9 ones. Notice two rollovers.",
    ),
    t(
        id="y3-written-add-subtract",
        year=3,
        strand="Addition and subtraction",
        title="The written method for 3-digit add and subtract",
        shortTitle="Written +/− 3-digit",
        summary="Line ones under ones, tens under tens, hundreds under hundreds, and exchange when a column is 10 or more, or not enough.",
        prerequisites=["y3-mental-add-subtract", "y3-complements-to-100"],
        statutoryOutcomes=["Add and subtract numbers with up to 3 digits, using formal written methods of columnar addition and subtraction"],
        readyToProgress=["3AS-2"],
        whyThisMatters="School’s compact written method is the same idea as exchanging ten ones for one ten. If the lining-up is wrong, the answer is theatre.",
        inPlainEnglish="You write the numbers so each place sits in its own column. Add (or subtract) that column. Ten ones become one ten. Ten tens become one hundred. Subtraction may need the reverse swap: break a ten into ten ones.",
        howSchoolTeachesIt="Most schools start with equipment beside the written digits, then compact the same steps onto paper. They talk about exchanging, not ‘carry the one’ as a magic chant. Subtraction is exchanging, not ‘borrow and pay back’ from older schooldays.",
        sayThis=[
            "Are the ones sitting under ones?",
            "This column is 14 ones. How do we exchange that?",
            "There are not enough ones. What can we break?",
        ],
        avoidThis=[
            "Teaching ‘carry the one’ with no exchange of ten ones for one ten.",
            "The old ‘borrow and pay back’ rhyme if it clashes with how their school says exchange.",
        ],
        misconceptions=[
            mis("They add from the left, hundreds first, then get stuck when ones overflow.", "Left-to-right reading fights the usual school compact method.", "Start at the ones, because that is where extra tens are born."),
            mis("They subtract the smaller digit from the larger in a column, ignoring which number is on top.", "They want every column to ‘work’ without exchanging.", "If the top ones are smaller, exchange from the tens first, then subtract."),
        ],
        youAreReadyWhen="You can line up a 3-digit add and a 3-digit subtract, and you can explain one exchange in ordinary words.",
        householdItems=["Squared paper or a homemade column grid", "Pencil", "Optional: ten objects and a cup to act out one exchange"],
        setup="Draw three columns: H T O. Write 487 + 135, ones under ones. Keep ten counters and a cup nearby for the first exchange.",
        activityTitle="One add with exchange, one subtract with exchange",
        steps=[
            "Add ones: 7 + 5 = 12 ones. Exchange 10 ones for 1 ten. Write 2 in the ones, and the extra ten with the tens.",
            "Finish the tens and hundreds. Read the total.",
            "Write 352 − 118. Ones: not enough. Exchange one ten for ten ones, then subtract.",
            "Finish the columns. Check with a rough estimate: 350 − 120 is about 230.",
        ],
        check=[
            chk("Why must 5 sit under 7 in 487 + 135?", "Both are ones.", "Because 5 is smaller, or ‘to look neat’.", "Each column is one place. Ones with ones."),
            chk("14 ones: what do you write in the ones column?", "4 ones, and 1 extra ten in the tens place.", "14 in the ones column.", "Ten ones make a ten. Four ones stay."),
            chk("In 352 − 118, why exchange a ten?", "There are not enough ones on top.", "Because you always exchange, or to make it harder.", "2 ones cannot take 8 ones. Break a ten."),
        ],
        stretch="Estimate 487 + 135 first (about 500 + 130) then compare with the written total.",
    ),
    t(
        id="y3-complements-to-100",
        year=3,
        strand="Addition and subtraction",
        title="Pairs that make 100",
        shortTitle="Complements to 100",
        summary="Know what sits with a two-digit number to make 100, using tens and ones, not a long count.",
        prerequisites=["y3-hundreds-tens-ones"],
        statutoryOutcomes=["Estimate the answer to a calculation and use inverse operations to check answers"],
        readyToProgress=["3AS-1"],
        whyThisMatters="Making 100 is the backbone of change, of crossing hundreds, and of checking subtraction.",
        inPlainEnglish="64 and 36 make 100 because 60 and 40 would make 100, but 64 has 4 extra ones, so the other part needs 4 fewer ones: 36. Another picture: 64 needs 6 more ones to reach 70, then 30 to reach 100.",
        howSchoolTeachesIt="School uses a hundred square, a blank 100-bead string picture, and ‘make 10 then make 100’. They often go via the next ten, not a single leap.",
        sayThis=[
            {"prompt": "64 and what make 100?", "listenFor": "36."},
            "How many to the next ten, then how many tens to 100?",
            "If 70 and 30 make 100, what about 72?",
        ],
        avoidThis=[
            "Only teaching 100 − 64 as a written subtract before they have a make-100 picture.",
            "Timed drills for complements. Slow and pictured is the Year 3 win.",
        ],
        misconceptions=[
            mis("They say 64 and 46 make 100, swapping tens and ones.", "They mirrored the digits instead of making 10 in each place.", "6 tens need 4 tens to make 10 tens. 4 ones need 6 ones to make 10 ones. That is 36, not 46."),
            mis("They count on in ones from 64 to 100 every time.", "They do not yet use the next ten as a stepping stone.", "Jump to 70 first (6), then jump 30."),
        ],
        youAreReadyWhen="You can find the partner to 100 for numbers such as 64, 85 and 70, and you can explain it with tens and ones.",
        householdItems=["A 10-by-10 grid drawn on paper (100 cells) or a hundred square", "Two colours of pen, or two types of small object to fill cells"],
        setup="Draw a 10-by-10 grid. Fill 64 cells in one colour (6 full rows and 4 more).",
        activityTitle="Fill to 100",
        steps=[
            "Count the empty cells by rows. Say how many to 100.",
            "Check by going to the next ten: 64 to 70 is 6, 70 to 100 is 30, total 36.",
            "Wipe and try 85.",
            "Try 70, which should feel like 3 empty rows.",
        ],
        check=[
            chk("45 and what make 100?", "55.", "65 or 54.", "4 tens need 6 tens; 5 ones need 5 ones — wait: 45 to 50 is 5, then 50 to 100 is 50, total 55."),
            chk("90 and what make 100?", "10.", "9 or 110.", "One more row of ten on the hundred grid."),
            chk("99 and what make 100?", "1.", "0 or 11.", "One empty cell."),
        ],
        stretch="Ask 100 − 64 as ‘the empty part’, then write the family: 64 + 36 = 100, 36 + 64 = 100, 100 − 36 = 64.",
    ),
    t(
        id="y3-tables-3-4-8",
        year=3,
        strand="Multiplication and division",
        title="The 3, 4 and 8 times tables",
        shortTitle="3, 4 and 8 tables",
        summary="See 3s, 4s and 8s as equal groups, and link 4 and 8 by doubling.",
        prerequisites=["y3-count-in-4-8-50-100"],
        statutoryOutcomes=["Recall and use multiplication and division facts for the 3, 4 and 8 multiplication tables"],
        readyToProgress=["3NF-2"],
        whyThisMatters="Year 4 will ask for all tables to 12 × 12. Year 3 builds 3, 4 and 8 with pictures, not only a chant.",
        inPlainEnglish="4 × 3 means four groups of three, or three groups of four. 8 × 3 can be thought of as double 4 × 3. Division is the same facts the other way: 24 ÷ 8 is ‘how many 8s in 24?’",
        howSchoolTeachesIt="School uses arrays (rows and columns of objects), number lines with equal jumps, and doubling from the 4s to the 8s. They practise the matching division facts in the same session.",
        sayThis=[
            "Show me 4 groups of 3.",
            "If 4 × 6 is 24, what is 8 × 6?",
            "How many 8s in 32?",
        ],
        avoidThis=[
            "Only chanting with no array or jump.",
            "Treating 8s as a brand-new table with no doubling link to 4s.",
        ],
        misconceptions=[
            mis("They know 4 × 5 = 20 but cannot say 20 ÷ 4.", "Multiplication and division are still two subjects in their head.", "Point to the array: 4 rows of 5. Cover a row and ask how many rows make 20."),
            mis("They double 4 × 6 wrongly as 4 × 12.", "They doubled the wrong number.", "Double the product: 24 doubled is 48, so 8 × 6 = 48. Or double the 4 groups into 8 groups of 6."),
        ],
        youAreReadyWhen="You can show 3, 4 and 8 as equal groups, and you can use doubling to move from a 4-fact to an 8-fact.",
        householdItems=["24 small objects, such as pasta or coins", "Paper to sketch arrays"],
        setup="Clear a space. Tonight live in 4s and 8s first, then one 3-fact family if there is time.",
        activityTitle="Arrays, then double the rows",
        steps=[
            "Make 4 rows of 6. Say 4 × 6 = 24. Split the 24 into 4 groups and into 6 groups.",
            "Double the rows to 8 rows of 6. Say 8 × 6 = 48.",
            "Ask 24 ÷ 4 and 24 ÷ 6 while the first array is still in reach.",
            "Make 3 rows of 5 if they still have energy.",
        ],
        check=[
            chk("4 × 8.", "32, with an array or jumps.", "28 or 36.", "8, 16, 24, 32 on a line, or 4 rows of 8."),
            chk("24 ÷ 3.", "8.", "6 or 21.", "How many 3s in 24? Make 3-groups until you hit 24."),
            chk("If 4 × 7 = 28, what is 8 × 7?", "56.", "35 or 48.", "Double 28, or double the four groups of 7."),
        ],
        stretch="Write the fact family for 3, 8 and 24.",
    ),
    t(
        id="y3-multiply-2-digit-by-1-digit",
        year=3,
        strand="Multiplication and division",
        title="Multiply a 2-digit number by a 1-digit number",
        shortTitle="TO × O",
        summary="Split the two-digit number into tens and ones, multiply each, then add — progressing toward school’s compact written method.",
        prerequisites=["y3-tables-3-4-8", "y3-hundreds-tens-ones"],
        statutoryOutcomes=[
            "Write and calculate mathematical statements for multiplication and division using the multiplication tables that they know, including for two-digit numbers times one-digit numbers, using mental and progressing to formal written methods",
        ],
        readyToProgress=["3MD-1"],
        whyThisMatters="23 × 4 is not a new kind of maths. It is 20 × 4 and 3 × 4 joined. School’s written layout is that split on paper.",
        inPlainEnglish="23 × 4 means 23, four times. Partition 23 into 20 and 3. Four twenties are 80. Four threes are 12. 80 and 12 make 92.",
        howSchoolTeachesIt="School uses a grid (area) picture or an expanded written method: 20 × 4 and 3 × 4 written one under the other, then a compact version. They do not start with a mysterious ‘put a zero’ without saying it is tens.",
        sayThis=[
            "Split 23 into tens and ones. Multiply each by 4.",
            "Four twenties — how many?",
            "Now join the two products.",
        ],
        avoidThis=[
            "A compact written method with no expanded picture first.",
            "‘Add a zero when you multiply by 10’ as a rhyme that hides place value.",
        ],
        misconceptions=[
            mis("They do 2 × 4 and 3 × 4 and write 812 or 20.", "They multiplied the digits, not twenty and three.", "Say ‘two tens, not two’."),
            mis("They add 23 four times and lose the running total.", "Repeated add is allowed, but it gets shaky past 6 adds.", "After two or three adds, switch to the tens-and-ones split."),
        ],
        youAreReadyWhen="You can work out 23 × 4 by 20 × 4 and 3 × 4, and you can add those parts.",
        householdItems=["Paper", "Objects to make 4 groups of 23 if the number is small, or 4 groups of 13 as a warm-up"],
        setup="Tonight’s main number is 23 × 4. Warm up with 13 × 4 if 23 feels large to build.",
        activityTitle="Two products, then join",
        steps=[
            "Write 23 as 20 + 3.",
            "Work 20 × 4 = 80 (four groups of two tens).",
            "Work 3 × 4 = 12.",
            "Add 80 and 12. If they are ready, write the same steps in an expanded layout.",
        ],
        check=[
            chk("12 × 4.", "48.", "16 or 44.", "10 × 4 = 40, 2 × 4 = 8, join."),
            chk("23 × 3.", "69.", "26 or 29.", "20 × 3 = 60, 3 × 3 = 9."),
            chk("Why is 20 × 4 not 8?", "Because it is 4 groups of 2 tens, which is 8 tens, 80.", "They shrug, or say ‘add a zero’ with no meaning.", "Show 4 rows of 2 ten-sticks."),
        ],
        stretch="Try 34 × 3 the same way.",
    ),
    t(
        id="y3-scaling-and-correspondence",
        year=3,
        strand="Multiplication and division",
        title="Times as many, and matching groups",
        shortTitle="Scaling and matching",
        summary="Use multiplication for ‘3 times as long’ and for problems such as 3 hats with 4 coats.",
        prerequisites=["y3-tables-3-4-8"],
        statutoryOutcomes=[
            "Solve problems, including missing number problems, involving multiplication and division, including positive integer scaling problems and correspondence problems in which n objects are connected to m objects",
        ],
        whyThisMatters="Not every × sign is ‘lots of’. Sometimes it is stretching a length. Sometimes it is matching each of these with each of those.",
        inPlainEnglish="If a ribbon is 8 cm and another is 4 times as long, that is 32 cm. If there are 3 tops and 4 skirts, each top can pair with each skirt: 3 × 4 outfits.",
        howSchoolTeachesIt="School uses bars for ‘times as many’ and tree or grid pictures for matching. They ask which story is which, so children do not grab the two numbers and add.",
        sayThis=[
            "Is this ‘times as long’, or ‘each of these with each of those’?",
            "If one bar is 5 and the other is three times as long, how long is it?",
            "3 hats, 2 coats — how many outfits if each hat can go with each coat?",
        ],
        avoidThis=[
            "Giving only naked sums with no story.",
            "Always drawing the same picture for every word problem.",
        ],
        misconceptions=[
            mis("They add 3 and 4 for the outfit story.", "Matching feels like combining, so they add.", "Pick one hat and walk it past each coat. Repeat for each hat."),
            mis("They think ‘4 times as long’ means add 4.", "Times and add language get mixed.", "Draw the 8 cm bar, then four of those bars in a line."),
        ],
        youAreReadyWhen="You can tell a scaling story from a matching story and work a small example of each.",
        householdItems=["A few items of clothing or cutlery (such as 3 spoons and 2 forks)", "A piece of string or a strip of paper for the ‘times as long’ bar", "Paper"],
        setup="Put 3 spoons and 2 forks on the table. Cut a short paper strip as the ‘unit’ length.",
        activityTitle="Outfits, then a longer strip",
        steps=[
            "Match each spoon with each fork. Count the pairs. Write 3 × 2.",
            "Make a strip. Make another 4 times as long by laying four copies. Measure in spoon-lengths if you have no ruler.",
            "Invent one more story each: one matching, one scaling.",
            "Stop. Do not mix a third type of problem tonight.",
        ],
        check=[
            chk("2 tops, 4 trousers: how many outfits?", "8.", "6.", "Each top with each pair of trousers: 2 × 4."),
            chk("A stick is 6 paperclips long. One 3 times as long?", "18 paperclips.", "9.", "Three lots of 6."),
            chk("Is ‘each child gets 2 apples’ matching or equal groups?", "Equal groups (sharing/grouping), not the outfit grid.", "They call everything matching.", "This is 2 per child, not each-with-each."),
        ],
        stretch="3 hats, 4 coats, 2 bags — only if they are keen. Count with a systematic list.",
    ),
    t(
        id="y3-tenths",
        year=3,
        strand="Fractions",
        title="Tenths",
        shortTitle="Tenths",
        summary="A tenth is one of ten equal parts, and also what you get when you divide a one by 10.",
        prerequisites=["y3-hundreds-tens-ones"],
        statutoryOutcomes=[
            "Count up and down in tenths; recognise that tenths arise from dividing an object into 10 equal parts and in dividing one-digit numbers or quantities by 10",
        ],
        whyThisMatters="Tenths are the bridge from fractions to decimal money and measures in Year 4.",
        inPlainEnglish="If a chocolate bar is split into 10 equal pieces, each piece is one tenth. If you share 1 whole equally with 10 people, each gets one tenth. Counting 1/10, 2/10, 3/10 is like counting in a new unit.",
        howSchoolTeachesIt="School uses a bar split into 10, a number line from 0 to 1 marked in tenths, and place-value talk: 3 tenths is 3/10. They count forwards and backwards through 1, such as 8/10, 9/10, 10/10 = 1, 11/10.",
        sayThis=[
            "Are these ten parts equal?",
            "Count in tenths from 0 to 1.",
            "What is 3 shared into 10 equal parts?",
        ],
        avoidThis=[
            "Writing 0.3 before they have a tenth picture, unless school has already shown that link.",
            "Unequal ‘slices’ called tenths.",
        ],
        misconceptions=[
            mis("They think 1/10 is smaller than 1/12 because 10 is smaller than 12.", "They compare denominators as if bigger means more.", "More equal parts means each part is smaller. Ten tenths fill the same whole as twelve twelfths."),
            mis("They count 1/10, 2/10, 4/10 — skipping.", "The count is not yet a equal jump.", "Walk a line with ten equal marks from 0 to 1."),
        ],
        youAreReadyWhen="You can show one tenth of a whole and count in tenths at least up to 1.",
        householdItems=["A strip of paper to fold or mark into 10 equal parts", "A ruler if you have one (10 cm makes tenths of 10 cm easy)", "Pencil"],
        setup="Cut a paper strip. Mark it into 10 equal parts as carefully as you can. Label 0 and 1 at the ends.",
        activityTitle="Walk tenths on a strip",
        steps=[
            "Shade 1 part. Say one tenth. Shade 3 parts. Say three tenths.",
            "Count along the marks: one tenth, two tenths… ten tenths is the whole.",
            "Ask what 2/10 more than 5/10 is.",
            "If you have 3 identical strips, talk about 3 wholes shared into 10 equal shares (each share is 3/10).",
        ],
        check=[
            chk("Show 7/10 on the strip.", "Seven equal parts shaded.", "Seven random marks, or 1/7.", "Count seven of the ten parts."),
            chk("What is 10/10?", "1 whole.", "10, or 1/10.", "All ten parts fill the strip."),
            chk("1 metre in 10 equal parts — what is each part?", "1/10 of a metre, or 10 cm if you use that language.", "10 metres.", "Dividing one by ten makes tenths."),
        ],
        stretch="Count past 1: 11/10 is 1 and 1/10.",
    ),
    t(
        id="y3-unit-and-non-unit-fractions",
        year=3,
        strand="Fractions",
        title="Unit fractions and other fractions of a set",
        shortTitle="Fractions of a set",
        summary="Find 1/5 of 15, then 2/5 of 15, by sharing into equal groups.",
        prerequisites=["y3-tenths", "y3-tables-3-4-8"],
        statutoryOutcomes=[
            "Recognise, find and write fractions of a discrete set of objects: unit fractions and non-unit fractions with small denominators",
            "Recognise and use fractions as numbers: unit fractions and non-unit fractions with small denominators",
        ],
        readyToProgress=["3F-1", "3F-2"],
        whyThisMatters="A fraction of a pile of objects is how school later finds a fraction of a quantity. The sharing must be equal.",
        inPlainEnglish="1/5 of 15 is one share when 15 is split into 5 equal groups: 3. 2/5 is two of those shares: 6. The denominator tells you how many equal groups. The numerator tells you how many groups you take.",
        howSchoolTeachesIt="School shares objects into equal groups, then takes some of the groups. They also place fractions on a number line as numbers, not only as pizza slices.",
        sayThis=[
            "How many equal groups? That is the bottom number.",
            "How many groups are we taking? That is the top number.",
            "If 1/5 of 15 is 3, what is 2/5?",
        ],
        avoidThis=[
            "Always drawing pizza. Sets of objects matter as much as shapes.",
            "Cross-multiplying or other later tricks.",
        ],
        misconceptions=[
            mis("They split 15 into 5 and leftover 10, so groups are not equal.", "They make five groups that are not the same size.", "Share one-by-one into five plates until all 15 are gone."),
            mis("They think 2/5 is twice 15, or 2 + 5.", "The two numbers in the fraction feel like a sum or a times.", "Build 1/5 first, then take two of those shares."),
        ],
        youAreReadyWhen="You can find a unit fraction of a small set, then a non-unit fraction, by equal sharing.",
        householdItems=["15 small objects, such as raisins or Lego", "5 plates, cups, or drawn circles"],
        setup="Put 15 objects in a pile. Draw 5 circles or set 5 plates.",
        activityTitle="Share, then take some plates",
        steps=[
            "Share 15 one-by-one onto 5 plates. Say 1/5 is 3.",
            "Take 2 plates. Say 2/5 is 6.",
            "Put them back. Take 3 plates for 3/5.",
            "If steady, try 1/4 of 12 with 4 plates.",
        ],
        check=[
            chk("1/3 of 12.", "4.", "3 or 9.", "Three equal plates. One plate is 4."),
            chk("2/3 of 12.", "8.", "6 or 2.", "Two of those plates."),
            chk("Why can’t we do 1/5 of 14 with whole objects?", "14 does not share equally into 5 whole objects.", "They force leftover objects onto one plate.", "Equal groups cannot have leftovers if we want a whole-number share."),
        ],
        stretch="Place 0, 1/5, 2/5 … 1 on a line using the 15 objects as a ‘whole’.",
    ),
    t(
        id="y3-equivalent-fractions",
        year=3,
        strand="Fractions",
        title="Equivalent fractions with small denominators",
        shortTitle="Equivalent fractions",
        summary="See that 1/2 can look like 2/4 or 3/6 when the parts are equal and cover the same amount.",
        prerequisites=["y3-unit-and-non-unit-fractions"],
        statutoryOutcomes=["Recognise and show, using diagrams, equivalent fractions with small denominators"],
        whyThisMatters="Equivalence is how children later add fractions and simplify. Year 3 is pictures, not a cancel-digits trick.",
        inPlainEnglish="Two fractions are equivalent when they name the same amount of the whole. Half a bar is the same as two quarters of the same bar.",
        howSchoolTeachesIt="School folds paper, draws bars the same length with different equal splits, and sometimes uses a fraction wall. They may notice multiplying top and bottom by the same number, after the picture is solid.",
        sayThis=[
            "Do these two shadings cover the same amount of the bar?",
            "If I split each half into two, what do the parts become?",
            "Name another fraction that matches 1/3 on this wall.",
        ],
        avoidThis=[
            "Cancelling digits with no picture.",
            "Saying 1/2 = 2/4 because ‘you double both numbers’ before they see the extra split.",
        ],
        misconceptions=[
            mis("They think 1/2 is bigger than 2/4 because halves sound bigger.", "The words fight the picture.", "Lay a half bar on top of two quarters."),
            mis("They shade 2 of 4 parts that are not equal.", "Unequal parts are not quarters.", "Fold, don’t freehand, if the splits look wild."),
        ],
        youAreReadyWhen="You can show 1/2 = 2/4 (or 1/3 = 2/6) on the same-size whole.",
        householdItems=["Strips of paper the same length", "A pencil", "Optional: a chocolate bar picture drawn as a rectangle"],
        setup="Cut two strips the same length. One will be halves, one quarters.",
        activityTitle="Same strip, extra folds",
        steps=[
            "Fold strip A in half. Shade one half.",
            "Fold strip B in half, then each half again. Shade two quarters.",
            "Stack them. Are the shaded lengths the same?",
            "Try thirds and sixths if the folds behave.",
        ],
        check=[
            chk("Show 1/2 and 2/4 on same-size strips.", "Shaded lengths match.", "Different-length wholes, or 1/2 vs 1/4.", "Same strip length first. Then extra fold."),
            chk("1/3 and 2/6 — same amount?", "Yes, if the whole is the same.", "No, because 2 is more than 1.", "Split each third in two."),
            chk("Why isn’t 1/2 the same as 1/3?", "Halves are bigger parts than thirds of the same whole.", "They say it is the same because both start with 1.", "Compare one half-strip and one third-strip."),
        ],
        stretch="Build a mini fraction wall: 1, halves, thirds, quarters.",
    ),
    t(
        id="y3-add-subtract-fractions",
        year=3,
        strand="Fractions",
        title="Add and subtract fractions with the same denominator",
        shortTitle="Add/subtract fractions",
        summary="Add or take unit pieces that are the same size, staying within one whole.",
        prerequisites=["y3-equivalent-fractions"],
        statutoryOutcomes=[
            "Add and subtract fractions with the same denominator within one whole",
            "Compare and order unit fractions, and fractions with the same denominators",
        ],
        readyToProgress=["3F-4"],
        whyThisMatters="Same-size pieces can be counted. Different-size pieces cannot be added until a later year.",
        inPlainEnglish="2/7 + 3/7 is five sevenths, because you are counting sevenths. 5/7 − 2/7 is three sevenths. Stay within one whole in Year 3 (no 5/7 + 4/7 = 9/7 unless school has gone there).",
        howSchoolTeachesIt="School uses a bar of 7 equal parts. Shade 2, then 3 more. They compare 3/8 and 5/8 by looking at how many pieces.",
        sayThis=[
            "What size is each piece? Are they the same?",
            "How many sevenths will we have altogether?",
            "Which is greater, 3/8 or 5/8?",
        ],
        avoidThis=[
            "Adding tops and bottoms: 1/5 + 2/5 is not 3/10.",
            "Crossing into different denominators.",
        ],
        misconceptions=[
            mis("They add denominators as well as numerators.", "Two numbers in each fraction feel like two sums.", "Keep the piece size. Only the count of pieces changes."),
            mis("They refuse to add 2/7 + 3/7 because ‘you cannot add fractions’.", "A remembered rule from somewhere.", "Count the shaded sevenths."),
        ],
        youAreReadyWhen="You can add and subtract fractions with the same denominator within 1, and compare two of them.",
        householdItems=["A strip marked into 7 or 8 equal parts", "Two colours of pen"],
        setup="Mark a strip into 7 equal parts. Tonight all pieces are sevenths.",
        activityTitle="Count sevenths",
        steps=[
            "Shade 2/7 in one colour. Shade 3/7 more in another. Say 5/7.",
            "From 5/7, cover 2/7. Say 3/7 left.",
            "Compare 3/7 and 5/7 on the same strip.",
            "Try eighths if they are still keen.",
        ],
        check=[
            chk("2/7 + 4/7.", "6/7.", "6/14 or 8/7.", "Six sevenths. The 7 stays."),
            chk("6/8 − 2/8.", "4/8 (or 1/2 if they see it).", "4/0 or 8/6.", "Four eighths left."),
            chk("Which is smaller: 2/5 or 4/5?", "2/5.", "2/5 is bigger because 2 is luckier, or they pick 4/5 as smaller.", "Same size pieces: fewer pieces is smaller."),
        ],
        stretch="If they see 4/8 = 1/2, celebrate, then still write 4/8 for this pack’s adding.",
    ),
    t(
        id="y3-length-mass-capacity",
        year=3,
        strand="Measurement",
        title="Length, mass and capacity",
        shortTitle="Measure and compare",
        summary="Measure and compare metres and centimetres, kilograms and grams, litres and millilitres, including simple mixed units.",
        statutoryOutcomes=["Measure, compare, add and subtract: lengths (m/cm/mm); mass (kg/g); volume/capacity (l/ml)"],
        whyThisMatters="School science, cooking, and later decimals all sit on these units. Year 3 is practical measuring, not converting everything in a table.",
        inPlainEnglish="A metre is 100 centimetres. A kilogram is 1000 grams. A litre is 1000 millilitres. You compare by measuring, and you can add two lengths or two masses with the same unit.",
        howSchoolTeachesIt="School uses rulers, scales and jugs. They compare mixed amounts such as 1 kg and 200 g. They connect doubling a length to multiplication.",
        sayThis=[
            "Which unit fits this? Metre or centimetre?",
            "Line them up at the same start before you compare length.",
            "Is 1 kg 200 g more or less than 1 kg 50 g?",
        ],
        avoidThis=[
            "Asking for a conversion table with no measuring.",
            "Comparing lengths from different starting points.",
        ],
        misconceptions=[
            mis("They think 50 cm is longer than 1 m because 50 > 1.", "They compare the numbers and ignore the unit.", "Lay a metre stick (or a 100 cm tape of paper) next to 50 cm."),
            mis("They read 200 ml as 200 litres.", "The unit word was skipped.", "Point to the jug’s scale. Say the unit every time."),
        ],
        youAreReadyWhen="You can measure a length, a mass or a pour in an everyday unit and compare two amounts with the unit said out loud.",
        householdItems=[
            "A ruler or a homemade 30 cm mark on paper",
            "Kitchen scales if you have them, or two bags of rice/flour to compare by feel then check",
            "A measuring jug or a 500 ml bottle",
        ],
        setup="Pick one quantity tonight if kit is thin: length is enough. Put two objects to compare, such as a book and a spoon.",
        activityTitle="Measure, compare, add",
        steps=[
            "Measure two lengths in cm. Say which is longer. Add the lengths.",
            "If you have scales, weigh a fruit and a mug in g. Compare.",
            "If you have a jug, pour 100 ml then 200 ml. Which is more? How much altogether?",
            "Write one mixed unit, such as 1 m 20 cm, as a sentence, not a trick.",
        ],
        check=[
            chk("Which is longer: 1 m or 80 cm?", "1 m.", "80 cm.", "1 m is 100 cm."),
            chk("Add 12 cm and 9 cm.", "21 cm.", "21 m, or 3 cm.", "Same unit: add the numbers, keep cm."),
            chk("Read 250 ml on a jug (or a 250 ml bottle).", "About a quarter of a litre if the jug shows 1 l.", "250 litres.", "Say millilitres. 1000 ml fill 1 litre."),
        ],
        stretch="A ribbon 15 cm, another 4 times as long. Connect to last week’s scaling.",
    ),
    t(
        id="y3-perimeter",
        year=3,
        strand="Measurement",
        title="Perimeter of simple shapes",
        shortTitle="Perimeter",
        summary="Perimeter is the distance around the edge — add the sides, do not fill the middle.",
        prerequisites=["y3-length-mass-capacity"],
        statutoryOutcomes=["Measure the perimeter of simple 2-D shapes"],
        whyThisMatters="Area comes later. If perimeter and filling-the-middle get mixed now, Year 4 is harder.",
        inPlainEnglish="Walk the fence. Add the lengths of all sides. A rectangle that is 6 cm by 4 cm has perimeter 6 + 4 + 6 + 4.",
        howSchoolTeachesIt="School uses string around a book, then a ruler on a drawn rectangle. They mark each side as they add so none is missed or counted twice.",
        sayThis=[
            "Are we walking the edge, or filling the inside?",
            "Have we added every side once?",
            "Opposite sides of this rectangle — are they equal?",
        ],
        avoidThis=[
            "The formula 2(l + w) before they have added four sides.",
            "Calling the space inside ‘perimeter’.",
        ],
        misconceptions=[
            mis("They add only two sides of a rectangle.", "They see length and width and stop.", "Walk all the way round. Four sides."),
            mis("They count squares inside and call it perimeter.", "Area language leaked in.", "Put a finger on the outline only."),
        ],
        youAreReadyWhen="You can measure or read the sides of a simple shape and add them once each.",
        householdItems=["A book, postcard, or phone", "String or wool", "A ruler if you have one"],
        setup="Choose a rectangular object. Have string to wrap the edge.",
        activityTitle="String around, then add the sides",
        steps=[
            "Wrap string around the book. Stretch the string on a ruler or against a 10 cm mark repeated.",
            "Measure each side. Add  length + width + length + width.",
            "Compare string total and added sides. Talk about any gap.",
            "Draw a triangle on paper and add its three sides.",
        ],
        check=[
            chk("A 5 cm by 3 cm rectangle: perimeter?", "16 cm.", "8 cm or 15 cm.", "5+3+5+3."),
            chk("Why not 5 × 3?", "That would fill the inside, not walk the edge.", "They think times is always shorter.", "Times might come later for area. Tonight we add sides."),
            chk("Equilateral triangle, side 6 cm.", "18 cm.", "12 cm.", "Three equal sides."),
        ],
        stretch="An L-shape made of two rectangles — add every outer side, no extra interior cut.",
    ),
    t(
        id="y3-money",
        year=3,
        strand="Measurement",
        title="Pounds and pence, including change",
        shortTitle="Money and change",
        summary="Add and subtract amounts in £ and p, and give change, keeping pounds and pence named.",
        statutoryOutcomes=["Add and subtract amounts of money to give change, using both £ and p in practical contexts"],
        whyThisMatters="Year 4 will write money with a decimal point. Year 3 keeps £ and p spoken clearly so the point later has meaning.",
        inPlainEnglish="£2 and 40p plus 80p is £3 and 20p, because 40p and 80p make 120p, which is £1 and 20p. Change from £5 for something costing £3.70 is the gap to £5.",
        howSchoolTeachesIt="School uses coins and a number line to the next pound. They record £ and p separately. They do not rush the decimal point.",
        sayThis=[
            "How many pence in a pound?",
            "Count the pence first — do they make another pound?",
            "What could we add to reach the next pound, then the note?",
        ],
        avoidThis=[
            "Writing £2.4 for £2.40.",
            "Mixing £ and p in one number without saying which is which.",
        ],
        misconceptions=[
            mis("They think 40p + 80p is 120 pounds.", "The unit dropped.", "Keep saying pence until you exchange 100p for £1."),
            mis("They give change by adding on in ones only, and get lost.", "No stepping-stone to the next 10p or pound.", "Jump to the next 10p, then the next pound, then the note."),
        ],
        youAreReadyWhen="You can add two simple amounts and give change from a pound or a £5 note using coins or a line.",
        householdItems=["Real or play coins: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2 if you have them", "A homemade shop list with three prices"],
        setup="Set a mini shop: three items priced 35p, £1.20 (say as £1 and 20p), and 80p. Have a £2 coin or two pound coins.",
        activityTitle="Buy two things and give change",
        steps=[
            "Buy 35p and 80p. Make the total with coins. Exchange 100p for £1 if needed.",
            "Pay with £2. Count on from the total to £2 for change.",
            "Buy the £1 and 20p item with £2. Find change.",
            "Write the totals as £ and p words, not a decimal, unless they already use school’s decimal money.",
        ],
        check=[
            chk("30p + 80p.", "£1 and 10p.", "110 pounds, or 50p.", "110p is £1 and 10p."),
            chk("Change from £1 for 65p.", "35p.", "45p or £35.", "65p to 70p is 5p, then 30p to £1."),
            chk("How many 10p in £1?", "10.", "100 or 1.", "10 × 10p = 100p = £1."),
        ],
        stretch="Three items, two-step: total then change from £5.",
    ),
    t(
        id="y3-time-to-the-minute",
        year=3,
        strand="Measurement",
        title="Time to the nearest minute",
        shortTitle="Time to the minute",
        summary="Read analogue clocks, including Roman numerals I to XII, and use am, pm and 24-hour language at school’s pace.",
        statutoryOutcomes=[
            "Tell and write the time from an analogue clock, including using Roman numerals from I to XII, and 12-hour and 24-hour clocks",
            "Estimate and read time with increasing accuracy to the nearest minute",
            "Know the number of seconds in a minute and the number of days in each month, year and leap year",
        ],
        whyThisMatters="Year 4 will convert analogue and digital 24-hour as a matter of course. Year 3 tightens minute-reading and duration.",
        inPlainEnglish="The minute hand on 4 means 20 minutes if each number is 5 minutes, but to the nearest minute you also read the little marks. 60 seconds make a minute. am is morning, pm is afternoon and evening.",
        howSchoolTeachesIt="School uses geared clocks so hour and minute hands move together. They count in 5s around the clock, then use the minute marks. Roman numerals appear on some classroom clocks.",
        sayThis=[
            "Where is the minute hand pointing?",
            "Count in 5s to that number, then add the extra minute marks.",
            "Is this morning or afternoon — am or pm?",
        ],
        avoidThis=[
            "Teaching a 24-hour digital conversion drill before analogue minutes are steady.",
            "Saying ‘the little hand doesn’t matter’ — the hour hand also moves as minutes pass.",
        ],
        misconceptions=[
            mis("They read 4:20 as 4:04 because the minute hand is on 4.", "They counted the number as minutes, not 5-minute chunks.", "Each number the minute hand points to is 5 minutes. 4 means 20 minutes."),
            mis("They think 60 minutes make an hour but 100 seconds make a minute.", "Base 10 leaks in.", "Count 60 claps as a minute if you can bear it, or a 60-second sand-timer / phone timer."),
        ],
        youAreReadyWhen="You can read a time to the nearest 5 minutes and have a go at the nearest minute, and you know 60 seconds make a minute.",
        householdItems=["An analogue clock or a homemade clock from a paper plate with two card hands", "Optional: a phone timer for 60 seconds"],
        setup="Make or fetch a clock face. Mark 12, 3, 6, 9 first, then the other numbers. If you use Roman numerals, write I–XII.",
        activityTitle="Set, read, wait one minute",
        steps=[
            "Set 4:00, then 4:20, then 4:23 if you have minute marks.",
            "Count 60 seconds with a timer. That is one minute. Move the minute hand one mark.",
            "Talk through a simple duration: programme starts at 4:10 and lasts 20 minutes. When does it end?",
            "Name today’s date month length if you know it (30, 31, 28/29).",
        ],
        check=[
            chk("Minute hand on 6, hour hand halfway past 2. What time?", "Half past 2, or 2:30.", "6:02.", "Minute hand on 6 is 30 minutes."),
            chk("How many seconds in a minute?", "60.", "100 or 30.", "Sixty."),
            chk("3:55 — how many minutes until 4:00?", "5.", "55 or 15.", "Count 56, 57, 58, 59, 60 / 4:00."),
        ],
        stretch="Read a 24-hour bus time such as 15:10 as 3:10 pm if school has started that.",
    ),
    t(
        id="y3-right-angles",
        year=3,
        strand="Geometry",
        title="Right angles as square corners and as turns",
        shortTitle="Right angles",
        summary="A right angle is a square corner. Two of them make a half-turn; four make a full turn.",
        statutoryOutcomes=[
            "Recognise angles as a property of shape or a description of a turn",
            "Identify right angles, recognise that 2 right angles make a half-turn, 3 make three-quarters of a turn and 4 a complete turn; identify whether angles are greater than or less than a right angle",
        ],
        readyToProgress=["3G-1"],
        whyThisMatters="Later degree measures sit on this picture. ‘Bigger than a right angle’ is enough in Year 3 — names acute and obtuse can wait until Year 4 if school waits.",
        inPlainEnglish="The corner of a book is a right angle. A quarter-turn on the spot is also a right angle. An angle can be a corner of a shape or an amount of turn.",
        howSchoolTeachesIt="School uses a right-angle tester (a card square corner) on shapes and on turns. Children compare corners to the tester: smaller, the same, or larger.",
        sayThis=[
            "Is this corner the same as the square tester, smaller, or larger?",
            "Turn a quarter-turn. That is one right angle.",
            "How many right-angle turns to face the way you started?",
        ],
        avoidThis=[
            "Protractors and degrees unless school has already introduced them.",
            "Calling every corner a right angle.",
        ],
        misconceptions=[
            mis("They think a long-sided shape must have larger angles.", "Side length and angle size got mixed.", "Compare only the opening with the tester, not how long the sides are."),
            mis("They think a right angle has to sit on the table ‘pointing up’.", "Orientation fooled them.", "Rotate the book. The corner is still a right angle."),
        ],
        youAreReadyWhen="You can find right angles on objects, and you can show a quarter-turn as one right angle.",
        householdItems=["A book or cereal box (square corners)", "A square of card as a tester", "A person willing to turn on the spot"],
        setup="Cut a square of card. The corner is your tester. Clear a space to turn.",
        activityTitle="Tester on corners, then quarter-turns",
        steps=[
            "Test the book’s corners. Then test a slice of pizza-shaped paper (or a door opened a little) that is not a right angle.",
            "Stand up. Face a window. Make one quarter-turn. Check with the tester held at your feet if that helps.",
            "Two quarter-turns: you face opposite. Four: you are back.",
            "Hunt three right angles and one angle that is larger.",
        ],
        check=[
            chk("How many right angles in a full turn?", "4.", "2 or 360.", "Four quarter-turns."),
            chk("Is the point of a typical slice of toast a right angle?", "Often yes if it is a square cut; a diagonal cut is smaller.", "They guess without the tester.", "Use the tester."),
            chk("Two right-angle turns — what fraction of a full turn?", "A half-turn.", "A whole turn.", "Two quarters make a half."),
        ],
        stretch="Sort corners: smaller than, equal to, larger than a right angle.",
    ),
    t(
        id="y3-parallel-and-perpendicular",
        year=3,
        strand="Geometry",
        title="Parallel and perpendicular lines",
        shortTitle="Parallel and perpendicular",
        summary="Parallel lines stay the same distance apart and never meet. Perpendicular lines meet at a right angle. Also spot horizontal and vertical.",
        prerequisites=["y3-right-angles"],
        statutoryOutcomes=["Identify horizontal and vertical lines and pairs of perpendicular and parallel lines"],
        readyToProgress=["3G-2"],
        whyThisMatters="Shape names in Year 4 (parallelogram, rectangle) depend on these relationships, not on ‘it looks slanty’.",
        inPlainEnglish="Train tracks are parallel: they do not get closer. A window frame’s corner is perpendicular: a square join. Horizontal is like the horizon; vertical is like a lamppost.",
        howSchoolTeachesIt="School uses geostrips, squared paper, and the right-angle tester where lines meet. They ask children to find pairs, not to memorise a rhyme only.",
        sayThis=[
            "Do these two lines ever need to meet? Do they stay the same distance?",
            "Do they meet in a square corner?",
            "Which lines are vertical in this window?",
        ],
        avoidThis=[
            "Saying parallel means ‘diagonal’ or ‘slanty’.",
            "Saying perpendicular means any two lines that cross.",
        ],
        misconceptions=[
            mis("They think parallel lines have to be the same length.", "They confuse segment length with the never-meet rule.", "Extend the lines in your imagination. Length of the stick is not the test."),
            mis("They think a + cross is perpendicular but a rotated + is not.", "Orientation again.", "Test the angle with the card. A square corner is still a square corner."),
        ],
        youAreReadyWhen="You can find a parallel pair and a perpendicular pair in the room, and you can show horizontal and vertical.",
        householdItems=["Two pencils or dry spaghetti", "A book or window frame", "The right-angle card tester from the last pack"],
        setup="Sit by a window or a rectangular table.",
        activityTitle="Find pairs, then make them with pencils",
        steps=[
            "Find two parallel edges on the table. Find two that meet at a square corner.",
            "Make parallel pencils. Make perpendicular pencils. Check with the tester.",
            "Point to a horizontal and a vertical edge.",
            "On paper, draw a capital H and talk about which segments are parallel.",
        ],
        check=[
            chk("Are the long edges of a typical book parallel?", "Yes.", "Only if the book is square.", "They stay the same distance and would not meet."),
            chk("A letter T: which join is perpendicular if it is drawn square?", "The meeting of the crossbar and stem.", "The two ends of the crossbar.", "Use the tester on the join."),
            chk("Can two pencils be parallel and not the same length?", "Yes.", "No.", "Extend them in your mind."),
        ],
        stretch="On a rectangle, how many pairs of parallel sides?",
    ),
    t(
        id="y3-2d-and-3d-shapes",
        year=3,
        strand="Geometry",
        title="Draw 2-D shapes and build 3-D shapes",
        shortTitle="2-D and 3-D shapes",
        summary="Draw flat shapes and make solids from stuff around the house, describing faces, edges and vertices.",
        statutoryOutcomes=[
            "Draw 2-D shapes and make 3-D shapes using modelling materials; recognise 3-D shapes in different orientations and describe them",
        ],
        whyThisMatters="Naming is not enough. School wants properties you can feel: how many faces meet, whether a face is a square.",
        inPlainEnglish="2-D is flat (triangle, hexagon). 3-D you can hold (cube, cuboid, cylinder, pyramid). Turning a shape does not change what it is.",
        howSchoolTeachesIt="School builds with plasticine, straws, or construction kits, and they look at boxes from odd angles. They use faces, edges, vertices.",
        sayThis=[
            "Can you hold it, or only draw it?",
            "How many faces? What shape are they?",
            "If I turn it, is it still a cube?",
        ],
        avoidThis=[
            "Only flashcard naming with no building.",
            "Calling every box a cube.",
        ],
        misconceptions=[
            mis("They call a cuboid a cube because it is boxy.", "Cube needs square faces.", "Check a face with the right-angle tester and compare side lengths."),
            mis("They think a pyramid on its side is a different shape.", "Orientation again.", "Count faces. Same solid."),
        ],
        youAreReadyWhen="You can draw a named 2-D shape and describe a 3-D object using faces and edges.",
        householdItems=["Scrap paper and a ruler or straight edge", "A cereal box, a tin, a ball", "Optional: cocktail sticks and marshmallows or Blu Tack to make a skeleton cube"],
        setup="Gather one box, one tin, one ball. Paper for drawing.",
        activityTitle="Draw, then describe the objects",
        steps=[
            "Draw a triangle, a hexagon, a square. Use a straight edge.",
            "Feel the cereal box. Count faces, edges, corners (vertices).",
            "Compare the tin (cylinder) and the ball (sphere): which has curved faces?",
            "Turn the box. Name it again.",
        ],
        check=[
            chk("How many faces on a typical cereal box?", "6.", "4 or 8.", "Four sides, top and bottom."),
            chk("Is the tin a cylinder or a cuboid?", "Cylinder (if it is a usual tin).", "Cube.", "Two circle faces and a curved surface."),
            chk("Draw a pentagon.", "Five-sided straight-edged shape.", "A star, or a house with extra bits.", "Five straight sides."),
        ],
        stretch="Make a cube skeleton with sticks. Count 12 edges and 8 vertices.",
    ),
    t(
        id="y3-bar-charts-and-tables",
        year=3,
        strand="Statistics",
        title="Bar charts, pictograms and tables",
        shortTitle="Charts and tables",
        summary="Read simple scales (2, 5 or 10 per step) and answer how many more / how many fewer.",
        statutoryOutcomes=[
            "Interpret and present data using bar charts, pictograms and tables",
            "Solve one-step and two-step questions using information presented in scaled bar charts and pictograms and tables",
        ],
        whyThisMatters="A bar that reaches the line labelled 10 may mean 20 if the scale is 2 per square. Missing the scale is the classic mix-up.",
        inPlainEnglish="A pictogram uses pictures. One picture might mean 2 children, not 1. A bar chart uses bar height. A table is a grid of numbers. Always read the key or scale first.",
        howSchoolTeachesIt="School builds a class pictogram, then a bar chart with a scale of 2 or 5. They ask two-step questions: how many more chose apples than pears?",
        sayThis=[
            "What does one picture stand for?",
            "What is each step on this scale worth?",
            "How many more… than…?",
        ],
        avoidThis=[
            "Skipping the key.",
            "Always using a scale of 1, which hides the Year 3 skill.",
        ],
        misconceptions=[
            mis("They count squares of bar height as 1 when the scale is 2.", "They ignored the axis labels.", "Finger the axis: 0, 2, 4, 6."),
            mis("They add all the numbers in a table when the question asked for a difference.", "More / fewer is a subtract.", "Find the two numbers, then find the gap."),
        ],
        youAreReadyWhen="You can read a pictogram key and a bar scale of 2 or 5, and answer a ‘how many more’ question.",
        householdItems=["Paper", "A handful of fruit, toys, or socks to sort into 3 categories", "Coloured pens"],
        setup="Sort 12–16 items into three groups, such as colours of socks. Tonight the scale will be 2.",
        activityTitle="Make a scale-2 pictogram",
        steps=[
            "Count each group. Write a table: type | number.",
            "Draw a pictogram where one smiley means 2 items. Use a half-symbol if you have an odd number.",
            "Draw a bar chart: axis 0, 2, 4, 6…",
            "Ask: how many more in the biggest group than the smallest?",
        ],
        check=[
            chk("If one picture means 2, what do 3½ pictures mean?", "7.", "3.5 or 5.", "Three pictures are 6, half a picture is 1."),
            chk("Bar to the 10 line, scale 2 per square and 5 squares tall — talk it through.", "10 if each square is 2.", "5.", "Read the axis, not only the square count."),
            chk("Table: cats 8, dogs 5. How many fewer dogs?", "3.", "13.", "The gap is 3."),
        ],
        stretch="Two-step: how many children chose cat or dog altogether, then how many more that is than hamster.",
    ),
]


def main() -> None:
    import runpy

    write_year(3, YEAR3)
    year4 = runpy.run_path(str(ROOT / "scripts/ks2_year4.py"))["YEAR4"]
    year5 = runpy.run_path(str(ROOT / "scripts/ks2_year5.py"))["YEAR5"]
    year6 = runpy.run_path(str(ROOT / "scripts/ks2_year6.py"))["YEAR6"]
    write_year(4, year4)
    write_year(5, year5)
    write_year(6, year6)
    print(f"total {len(YEAR3) + len(year4) + len(year5) + len(year6)} KS2 topics")


if __name__ == "__main__":
    main()
