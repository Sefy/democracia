import { Container } from "./container";
import { HfInference } from '@huggingface/inference';
import { env } from "../env";
import { MathUtil } from "../util/math-util";

const TRANSLATION_MODEL = "Helsinki-NLP/opus-mt-fr-en";
const TOXICITY_MODEL = 's-nlp/roberta_toxicity_classifier';

export class ToxicityService {

    hf: HfInference;

    constructor(private container: Container) {
        this.hf = new HfInference(env.HUGGING_FACE_TOKEN);
    }

    async evaluateToxicity(text: string) {
        try {
            // Translate text to English first
            const translatedText = await this.translateToEnglish(text);

            const result = await this.hf.textClassification({
                model: TOXICITY_MODEL,
                inputs: translatedText,
            });

            const firstCategory = result[0];

            if (firstCategory.label === 'toxic') {
                return MathUtil.round(firstCategory.score, 2);
            }

            return 0;
        } catch (error) {
            console.error('Classification error:', error);
            throw new Error('Failed to classify text');
        }
    }

    async translateToEnglish(text: string) {
        try {
            const result = await this.hf.translation({
                model: TRANSLATION_MODEL,
                inputs: text,
            });

            return (result as any).translation_text;
        } catch (error) {
            console.error('Translation error:', error);
            throw new Error('Failed to translate text');
        }
    }
}
