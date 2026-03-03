The Help to Buy (HTB) Staircasing calculations in the tool are designed to answer one main question: "When is the mathematically optimal time to buy back the government’s share of my home to save the most money?"

To figure this out, the application runs a brute-force financial simulation under the hood. Here is a step-by-step breakdown of exactly how it works:

1. The Baseline Projection (Do Nothing)
First, the engine calculates a "baseline" scenario where you never staircase and hold the 40% equity loan for the full 25-year remaining term. In this scenario, it calculates:

Your monthly mortgage payments changing from your current fixed rate to your new remortgage rate.
Your monthly HTB interest payments, which grow every April (by your assumed HTB annual growth rate).
The final amount of HTB interest you will have paid by the end of the term.
2. Simulating Every Possible Buyback Month
Next, the engine simulates staircasing (buying back the HTB loan) at every possible month between now and the end of your mortgage term.

For example, if it simulates staircasing in Month 12, it does the following:

Calculates the Cost to Buy Back: It looks at the projected value of your home in Month 12 (based on your 2% annual property growth assumption). Because HTB is an equity loan, you owe 40% of the current property value, not what you originally borrowed.
Adds the Cost to Your Mortgage: It simulates taking out a new mortgage to fund that buyback cost (plus the £300 valuation fee). Your mortgage balance spikes upward, and your monthly mortgage payments increase based on your new remortgage rate.
Stops the HTB Interest: From Month 13 onward, you no longer pay the HTB monthly interest fees.
3. Comparing the Results (Net Savings)
For every single month it simulated, it compares the total costs against the "baseline" scenario. The core formula for Net Savings is:

Net Savings = (Total HTB Interest Avoided) - (Extra Mortgage Interest Paid)

HTB Interest Avoided: The money you saved by not paying the government their monthly fee for the rest of the term.
Extra Mortgage Interest: The extra money you had to pay the bank because your mortgage loan was larger after absorbing the buyback cost.
The engine looks at the results for every month and finds the one month (or combination of months if you chose 2 or 3 staircases) that results in the highest Net Savings. That becomes your Optimal Timing.

4. The Rate Crossover (Why staircasing makes sense)
The reason early staircasing is often optimal is due to the "Rate Crossover".

Even though your HTB nominal interest rate might start very low (e.g., 1.8%), HTB is an equity loan, which means its Effective Rate is secretly much higher. The true cost of keeping the HTB loan for another year is a combination of two things:

The cash interest you pay them every month.
The fact that you are giving away 40% of your home's capital appreciation to the government.
The application calculates the Effective HTB Rate as: 

(Annual Cash Interest / Current Buyback Cost) + Annual Property Growth %
.

When you look at the Rate Comparison chart, you see a point where the red line (Effective HTB Rate) crosses above the blue dashed line (your Mortgage Rate). Whenever the red line is higher than the blue line, it is mathematically cheaper to borrow money from the bank to pay off the government. Because the HTB fee scales up steeply every April, that crossover usually happens very early in the loan lifecycle if your remortgage rate drops.