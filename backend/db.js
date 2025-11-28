import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DB_Url);

export default sql;