/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { useAsync } from 'react-use';
import {
  useApi,
  Progress,
  Content,
  Header,
  Page,
  ErrorPage,
} from '@backstage/core';
import { scaffolderApiRef } from '../../api';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  Box,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles,
} from '@material-ui/core';
import { JSONSchema } from '@backstage/catalog-model';

const useStyles = makeStyles(theme => ({
  table: {
    // minWidth: 650,
  },

  code: {
    fontFamily: 'Menlo, monospaced',
    padding: theme.spacing(1),
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[700]
        : theme.palette.grey[300],
    display: 'inline-block',
    borderRadius: 5,
    border: `1px solid ${theme.palette.grey[500]}`,
    position: 'relative',
  },

  codeRequired: {
    '&::after': {
      position: 'absolute',
      content: '"*"',
      top: 0,
      right: theme.spacing(0.5),
      fontWeight: 'bolder',
      color: theme.palette.error.light,
    },
  },
}));

export const ActionsPage = () => {
  const api = useApi(scaffolderApiRef);
  const classes = useStyles();
  const { loading, value, error } = useAsync(async () => {
    return api.listActions();
  });

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <ErrorPage
        statusMessage="Failed to load installed actions"
        status="500"
      />
    );
  }

  const formatRows = (input: JSONSchema) => {
    const properties = input.properties;
    if (!properties) {
      return undefined;
    }
    const required = input.required ? input.required : [];

    return Object.entries(properties).map(entry => {
      const [key, props] = entry;
      const isRequired = required.includes(key);

      const codeClassname = `${classes.code} ${
        isRequired ? classes.codeRequired : ''
      }`;
      return (
        <TableRow key={key}>
          <TableCell>
            <div className={codeClassname}>{key}</div>
          </TableCell>
          <TableCell>{props.title}</TableCell>
          <TableCell>{props.description}</TableCell>
          <TableCell>
            <span className={classes.code}>{props.type}</span>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderTable = (input: JSONSchema) => {
    return (
      <TableContainer component={Paper}>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{formatRows(input)}</TableBody>
        </Table>
      </TableContainer>
    );
  };

  const items = value?.map(action => {
    if (action.id.startsWith('legacy:')) {
      return undefined;
    }
    return (
      <Box pb={4}>
        <Typography variant="h4" className={classes.code}>
          {action.id}
        </Typography>
        {action.schema?.input && (
          <Box pb={2}>
            <Typography variant="h6">Input</Typography>
            {renderTable(action.schema.input)}
          </Box>
        )}
        {action.schema?.output && (
          <Box pb={2}>
            <Typography variant="h6">Output</Typography>
            {renderTable(action.schema.output)}
          </Box>
        )}
      </Box>
    );
  });

  return (
    <Page themeId="home">
      <Header
        pageTitleOverride="Create a New Component"
        title="Installed actions"
        subtitle="This is the collection of all installed actions"
      />
      <Content>{items}</Content>
    </Page>
  );
};
