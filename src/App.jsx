/* eslint-disable function-paren-newline */
/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import classNames from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => c.id === product.categoryId);
  const user = usersFromServer.find(u => u.id === category.ownerId);

  return {
    ...product,
    category,
    owner: user,
  };
});

export const DEFAULT = null;
export const COLUMNS = ['ID', 'Product', 'Category', 'User'];

export const App = () => {
  const [query, setQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(DEFAULT);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [sortType, setSortType] = useState(DEFAULT);
  const [reversed, setReversed] = useState(false);

  const onSelectPersonHandler = user => {
    // eslint-disable-next-line no-unused-expressions
    selectedPerson === user.id
      ? setSelectedPerson(DEFAULT)
      : setSelectedPerson(user);
  };

  const onResetHandler = () => {
    setSelectedPerson(DEFAULT);
    setQuery('');
    setCategoryFilter([]);

  }

  const categoriesFilterHandler = (category) => {
    if (categoryFilter.includes(category.id)) {
      setCategoryFilter(categoryFilter.filter(cat => category.id !== cat))
    } else {
      setCategoryFilter([...categoryFilter, category.id])
    }
  }

  let filtered = [...products]

  if (query) {
    filtered = filtered.filter(product => {
      const normilizedQuery = query.toLowerCase().trim();
      const normilizedProduct = product.name.toLowerCase().trim();

      return normilizedProduct.includes(normilizedQuery)
    })
  }

  if (selectedPerson) {
    filtered = filtered.filter(product => {
      return product.owner.id === selectedPerson.id;
    })
  }

  if (categoryFilter.length) {
    filtered = filtered.filter(product => {
      return categoryFilter.includes(product.categoryId)
    })
  }

  const sorted = [...filtered].sort((a, b) => {
    let result = 0;

    switch (sortType) {
      case 'ID':
        result = a.categoryId - b.categoryId
        break;
      case 'Product':
        result = a.name.localeCompare(b.name)
        break;
      case 'Category':
        result = a.category.title.localeCompare(b.category.title)
        break;
      case 'User':
        result = a.owner.name.localeCompare(b.owner.name)
        break;

      default:
        break;
    }

    return reversed ? -result : result
  })

  const sortHandler = (column) => {
    if (sortType !== column) {
      setSortType(column)
    }

    if (sortType === column) {
      setReversed(prev => !prev)
    }

    if (sortType === column && reversed) {
      setSortType(DEFAULT)
      setReversed(false)
    }
  }


  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                onClick={() => setSelectedPerson('')}
                data-cy="FilterAllUsers"
                href="#/"
              >
                All
              </a>

              {usersFromServer.map(user => {
                return (
                  <a
                    key={user.id}
                    data-cy="FilterUser"
                    href="#/"
                    onClick={() => onSelectPersonHandler(user)}
                    className={classNames(
                      { 'is-active': selectedPerson === user })
                    }
                  >
                    {user.name}
                  </a>
                );
              })}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={ev => setQuery(ev.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <button
                    data-cy="ClearButton"
                    type="button"
                    className="delete"
                  />
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames("button is-success mr-6 ", {
                  "is-outlined ": !categoryFilter.length,
                })}
                onClick={() => setCategoryFilter([])}
              >
                All
              </a>
              {categoriesFromServer.map(category => {
                return (
                  <a
                    key={category.id}
                    data-cy="Category"
                    className={classNames('button mr-2 my-1', {
                      'is-info': categoryFilter.includes(category.id),
                    })}
                    href="#/"
                    onClick={() => categoriesFilterHandler(category)}
                  >
                    {category.title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => onResetHandler()}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          <p data-cy="NoMatchingMessage">
            No products matching selected criteria
          </p>

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                {COLUMNS.map(column => {
                  return (
                    <th key={column}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}
                        <a href="#/"
                          onClick={() => sortHandler(column)}
                        >
                          <span
                            className="icon"
                          >
                            <i data-cy="SortIcon" className={
                              classNames("fas ", {
                                'fa-sort' : !reversed,
                                'fa-sort-up': !reversed && sortType === column,
                                'fa-sort-down': reversed,
                              })
                            } />
                          </span>
                          {/* <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span> */}
                          {/* <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-down" />
                      </span> */}
                        </a>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {sorted.length ? filtered.map(product => {
                return (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.categoryId}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={classNames('has-text-link', {
                        'has-text-danger': product.owner.sex === 'f',
                      })}
                    >
                      {product.owner.name}
                    </td>
                  </tr>
                );
              }) : 'No results'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
