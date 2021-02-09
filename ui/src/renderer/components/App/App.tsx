import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import { IFileTreeNode } from '../../../common/IFileTreeNode';
import { IpcService } from '../../services/IpcService';
import { formatDataSizeInLargetWholeUnit } from '../../utils/numberFormats';
import { SortDirection, sortObjectArrayByKey } from '../../utils/sorting';

enum FileTreeNodeSortType {
  Path = 'path',
  Size = 'size',
}

function FileTableRow(props: {
  node: IFileTreeNode;
  sortType: FileTreeNodeSortType;
  childSortDirection: SortDirection;
  showAbsPath: boolean;
}) {
  const [open, setOpen] = useState(false);

  const renderShowChildrenBtn = () => {
    if (props?.node?.isFile) return null;
    return (
      <IconButton size="small" onClick={() => setOpen(!open)}>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
    );
  };

  sortObjectArrayByKey(props.node.children, props.sortType, props.childSortDirection);

  return (
    <>
      <TableRow>
        <TableCell>{renderShowChildrenBtn()}</TableCell>
        <TableCell>{props.showAbsPath ? props.node.path : props.node.baseName}</TableCell>
        <TableCell>{formatDataSizeInLargetWholeUnit(props.node.size, 2)}</TableCell>
      </TableRow>
      <TableRow className="file-table-row-child-container">
        <TableCell className="file-table-row-child-table-cell" colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table>
              <TableBody>
                {props.node.children.map((childNode) => (
                  <FileTableRow
                    key={childNode.path}
                    node={childNode}
                    sortType={props.sortType}
                    childSortDirection={props.childSortDirection}
                    showAbsPath={false}
                  />
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function FileTable(props: { root: IFileTreeNode | null, isLoading: boolean }) {
  const [sortType, setSortType] = useState(FileTreeNodeSortType.Path);
  const [sortDirection, setSortDirection] = useState(SortDirection.Ascending);

  const updateSortingState = (newSortType: FileTreeNodeSortType) => {
    if (newSortType === sortType) {
      setSortDirection(
        sortDirection !== SortDirection.Ascending
          ? SortDirection.Ascending
          : SortDirection.Descending
      );
    } else {
      setSortType(newSortType);
      setSortDirection(SortDirection.Ascending);
    }
  };

  // RENDERING //

  const renderHeaderCell = (text: string, columnName: FileTreeNodeSortType) => {
    const muiSortDirection = sortDirection === SortDirection.Ascending ? 'asc' : 'desc';
    const isSortedColumn = sortType === columnName;
    return (
      <TableCell align="left" sortDirection={isSortedColumn ? muiSortDirection : false}>
        <TableSortLabel
          active={isSortedColumn}
          direction={muiSortDirection}
          onClick={() => updateSortingState(columnName)}>
          {text}
        </TableSortLabel>
      </TableCell>
    );
  };

  const renderBodyContent = () => {
    if (props.isLoading) {
      return <CircularProgress />;
    } else if (props.root !== null) {
      return (
        <FileTableRow
          node={props.root}
          sortType={sortType}
          childSortDirection={sortDirection}
          showAbsPath={true}
        />
      );
    }
    return null;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {renderHeaderCell('Path', FileTreeNodeSortType.Path)}
            {renderHeaderCell('Size', FileTreeNodeSortType.Size)}
          </TableRow>
        </TableHead>
        <TableBody className="file-table-body">
          {renderBodyContent()}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AppBody() {
  const [rootDirPath, setRootDirPath] = useState<string | null>(null);
  const [rootNode, setRootNode] = useState<IFileTreeNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldReload, setShouldReload] = useState<boolean>(false);

  useEffect(() => {
    if (shouldReload) {
      setIsLoading(true);
      IpcService.invoke('file-tree', {
        rootDir: rootDirPath,
      }).then((response: { root: IFileTreeNode }) => {
        setRootNode(response.root);
      }).catch((error) => {
        alert('Error: \n' + JSON.stringify(error)); // Don't judge me
      }).finally(() => {
        setIsLoading(false);
        setShouldReload(false);
      });
    }
  }, [rootNode, rootDirPath, shouldReload]);

  return (
    <Container className="app-body-container">
      <Box className="header-container">
        <TextField
          label="Directory"
          fullWidth
          value={rootDirPath}
          onChange={(event) => setRootDirPath(event.target.value)}
        />
        <Button onClick={() => setShouldReload(true)}>Submit</Button>
      </Box>
      <FileTable root={rootNode} isLoading={isLoading} />
    </Container>
  );
}

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={AppBody} />
      </Switch>
    </Router>
  );
}

export default App;
