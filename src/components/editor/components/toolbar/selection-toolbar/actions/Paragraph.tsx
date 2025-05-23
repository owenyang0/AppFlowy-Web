import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { getBlockEntry } from '@/application/slate-yjs/utils/editor';
import { BlockType } from '@/application/types';
import { ReactComponent as ParagraphSvg } from '@/assets/icons/text.svg';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSlateStatic } from 'slate-react';
import ActionButton from './ActionButton';

export function Paragraph() {
  const { t } = useTranslation();
  const editor = useSlateStatic() as YjsEditor;

  const onClick = useCallback(() => {
    const [node] = getBlockEntry(editor);

    if (!node) return;

    CustomEditor.turnToBlock(editor, node.blockId as string, BlockType.Paragraph, {});
  }, [editor]);

  const isActive = CustomEditor.isBlockActive(editor, BlockType.Paragraph);

  return (
    <ActionButton active={isActive} onClick={onClick} tooltip={t('editor.text')}>
      <ParagraphSvg className='h-4 w-4' />
    </ActionButton>
  );
}

export default Paragraph;
