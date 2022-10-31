import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';

export const isModalVisibleAtom = atom(false);
export const modalContentAtom = atom(<></>);
export const modalTitleAtom = atom('');

function GlobalModal() {
  const [isModalVisible, setIsModalVisible] = useAtom(isModalVisibleAtom);
  const [content] = useAtom(modalContentAtom);
  const [title] = useAtom(modalTitleAtom);

  const close = () => setIsModalVisible(false);

  return (
    <Modal isOpen={isModalVisible} onClose={close}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{content}</ModalBody>

        <ModalFooter>
          <Button w="full" colorScheme="pink" mr={3} onClick={close}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default GlobalModal;
