import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
export interface Label { productName: string | null; ingredients: string[]; allergenStatement: string | null }

const SYSTEM = `You read food packaging photos for a personal gut-symptom tracker. Return ONE JSON object and nothing else:
{"productName": string|null, "ingredients": string[], "allergenStatement": string|null}
ingredients: the ingredient statement as an ordered list of plain lowercase ingredient names, in label order. Flatten
parenthesised sub-ingredients into their own items right after the parent (e.g. "enriched flour", "wheat flour",
"niacin"). Drop percentages, asterisks, "contains 2% or less of", "and/or", vitamin codes and preservative notes. Keep
compound names intact ("garlic powder", "high fructose corn syrup", "chicory root fiber"). If the photo has no
ingredient list, return an empty array and put what you can see in productName. Never invent ingredients that are
not legible in the image.`;

export async function readLabel(imageBase64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp'): Promise<Label> {
  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 3000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
      { type: 'text', text: 'Extract the ingredient list.' },
    ] }],
  });
  if (response.stop_reason === 'refusal') throw new Error('The model declined to read this image.');
  const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n');
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error('No JSON in model response');
  const o = JSON.parse(json) as Partial<Label>;
  return {
    productName: typeof o.productName === 'string' ? o.productName.slice(0, 120) : null,
    ingredients: Array.isArray(o.ingredients) ? o.ingredients.filter((s): s is string => typeof s === 'string').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 80) : [],
    allergenStatement: typeof o.allergenStatement === 'string' ? o.allergenStatement.slice(0, 300) : null,
  };
}
