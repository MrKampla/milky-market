import { useToast } from '@chakra-ui/react';

export const toastErrorHandler = (toast: ReturnType<typeof useToast>) => ({
  onError(error: Error) {
    const message =
      (error as any).code === 'ACTION_REJECTED'
        ? 'User rejected the transaction'
        : error.message;

    toast({
      colorScheme: 'red',
      title: 'Error',
      description: message,
      status: 'error',
      duration: 9000,
      isClosable: true,
      position: 'top-right',
    });
  },
});
