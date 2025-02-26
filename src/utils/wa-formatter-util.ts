export const WaFormatterUtil = (editorText: string): string => {
  const waTextFormatts = [
    { regexp: new RegExp(/<strong>(.*?)<\/strong>/g), toReplace: "*$1*" },
    { regexp: new RegExp(/<\/p>\s*<p>/g), toReplace: "\n" },
    {
      regexp: new RegExp(/<\/?em>/g),
      toReplace: "_",
    },
  ];

  for (const { regexp, toReplace } of waTextFormatts) {
    editorText = editorText.replace(regexp, toReplace);
  }

  return editorText;
};
