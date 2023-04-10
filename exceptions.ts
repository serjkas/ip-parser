import fs from "fs";

const toOnlyIp = (
  line: string
): { ip: string | undefined; line: string } | null => {
  return {
    ip: line.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)?.[0],
    line: line,
  };
};

const getLines = async (systemPath: string, fileName: string) => {
  try {
    const results: { ip: string | undefined; line: string }[] = [];
    const data = await fs.readFileSync(`${systemPath}/${fileName}`, "utf8");
    data.split(/\r?\n/).forEach((line) => {
      if (line) {
        const ip = toOnlyIp(line);
        if (ip) {
          results.push(ip);
        }
      }
    });
    return results;
  } catch (err) {
    console.log(err);
  }
};

const getArgs = () => {
  const systemPath: string = process.cwd();
  const fileNameExceptions: string = process.argv[2];
  const mainFile: string = process.argv[3];

  return { systemPath, fileNameExceptions, mainFile };
};

const { systemPath, fileNameExceptions, mainFile } = getArgs();
const exceptions = await getLines(systemPath, fileNameExceptions);
const newIp = await getLines(systemPath, mainFile);

const newResults = newIp?.filter(
  (item) => !exceptions?.some((itemEx) => itemEx.ip === item.ip)
);

const writeStream = fs.createWriteStream("new_ips.txt");
const pathName = writeStream.path;

newResults?.forEach((value) => writeStream.write(`${value.line}\n`));
writeStream.on("finish", () => {
  console.log(`wrote all the array data to file ${pathName}`);
});
writeStream.on("error", (err) => {
  console.error(`There is an error writing the file ${pathName} => ${err}`);
});
writeStream.end();
