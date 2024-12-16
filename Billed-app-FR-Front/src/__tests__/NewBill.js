/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import router from '../app/Router.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

describe('Given I am a user connected as Employee', () => {

  describe('When I submit a new Bill', () => {
    test('Then show the new bill page', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'e@e' })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    // Test Integration POST a new file
    test('Then trigger create a file in store)', async () => {
      const onNavigate = () => {};
      jest.spyOn(mockStore, 'bills');
      const spyCreate = jest.fn(() => {
        return Promise.resolve({});
      });
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: spyCreate
        };
      });
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage
      });
      const mockEvent = {};
      mockEvent.preventDefault = jest.fn();
      mockEvent.target = { value: 'OK.png' };
      const fileInput = screen.getByTestId('file');
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      await userEvent.upload(fileInput, file);
      await newBillContainer.handleChangeFile(mockEvent);
      expect(spyCreate).toHaveBeenCalled();
    });
    // Vérifie si un fichier est bien chargé
    test('Then verify the file bill', async () => {
      jest.spyOn(mockStore, 'bills');
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      Object.defineProperty(window, 'location', {
        value: { hash: ROUTES_PATH['NewBill'] }
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });
      //création de l'objet file
      const file = new File(['File'], 'File.png', {
        type: 'image/png'
      });
      // création d'une fonction espion me permettant d'appeler la méthode handleChangeFile de l'objet newBill
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const proof = screen.getByTestId('file');
      proof.addEventListener('change', handleChangeFile);
      //simule l'upload d'un fichier en utilisant l'objet userEvent
      userEvent.upload(proof, file);
      expect(proof.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();
      // création d'une fonction espion me permettant d'appeler la méthode handleSubmit de l'objet newBill
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const formNewBill = screen.getByTestId('form-new-bill');
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  });