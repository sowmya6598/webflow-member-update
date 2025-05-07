import memberstackAdmin from "@memberstack/admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const SECRET_KEY = "";

const memberstack = memberstackAdmin.init(SECRET_KEY);

const limit = 60; // Number of results to fetch per request
const delay = 40; // Delay between requests in milliseconds

const emailsToUpdate = JSON.parse(fs.readFileSync("./emails.json", "utf-8"));


async function fetchMembers() {
  let cursor = null;
  let counter = 1;

  const response = await memberstack.members.list({ after: cursor, limit });
  const filteredList = response.data.filter(item =>emailsToUpdate.includes(item.auth.email) )

  while (true) {

    for (const member of filteredList) {

      const currentScore = member.customFields?.score ?? "0";
      const incrementedScore = (parseInt(currentScore, 10) + 1).toString();

      await memberstack.members.update({
        id: member.id,
        data: {
          customFields: { score: incrementedScore },
        },
      });
    
      counter++;
    }

    if (counter <= response.totalCount) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      cursor = response.endCursor;
    } else {
      console.log("All members fetched!");
      break;
    }
  }
}

fetchMembers();